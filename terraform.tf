variable "sql_server_password" {}

terraform {
  backend "azurerm" {
    storage_account_name = "lctfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}

resource "azurerm_resource_group" "app" {
  name     = "app-${terraform.workspace}"
  location = "West US"
}

resource "random_string" "sql_server_password" {
  length = 64
  upper = true
  min_upper = 1
  lower = true
  min_lower = 1
  number = true
  min_numeric = 1
  special = false
}

resource "azurerm_sql_server" "sql_server" {
  name                         = "loconomics-${terraform.workspace}"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  version                      = "12.0"
  administrator_login          = "loconomics"
  administrator_login_password = "${random_string.sql_server_password.result}"
}

resource "azurerm_sql_firewall_rule" "nolan_home" {
  name                = "NolanHome"
  resource_group_name = "${azurerm_resource_group.app.name}"
  server_name = "${azurerm_sql_server.sql_server.name}"
  start_ip_address    = "70.0.0.0"
  end_ip_address      = "71.0.0.0"
}

resource "azurerm_sql_database" "sql_server_database" {
  name                = "loconomics"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  server_name = "${azurerm_sql_server.sql_server.name}"
  depends_on = [
    "azurerm_sql_firewall_rule.nolan_home",
  ]
  provisioner "local-exec" {
    command = "mssql-scripter -U dev-loconomis -P ${var.sql_server_password} -S dev-loconomics.database.windows.net -d Dev >dev.sql"
  }
  provisioner "local-exec" {
    command = "sqlcmd -S ${azurerm_sql_server.sql_server.fully_qualified_domain_name} -U ${azurerm_sql_server.sql_server.administrator_login} -P \"${azurerm_sql_server.sql_server.administrator_login_password}\" -i dev.sql"
  }
}

resource "azurerm_resource_group" "app_deployment" {
  name = "app-${terraform.workspace}-deployment"
  location = "West US"
}

resource "azurerm_app_service_plan" "plan" {
  name = "plan"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  kind = "Linux"
  sku {
    tier = "Standard"
    size = "S1"
  }
}

// Derived from https://github.com/terraform-providers/terraform-provider-azurerm/issues/580
resource "azurerm_template_deployment" "app" {
  name = "app"
  // From https://www.terraform.io/docs/providers/azurerm/r/template_deployment.html:
  // Note on ARM Template Deployments: Due to the way the underlying Azure API is designed, Terraform can only manage the deployment of the ARM Template - and not any resources which are created by it. This 
  // means that when deleting the azurerm_template_deployment resource, Terraform will only remove the reference to the deployment, whilst leaving any resources created by that ARM Template Deployment. One 
  // workaround for this is to use a unique Resource Group for each ARM Template Deployment, which means deleting the Resource Group would contain any resources created within it - however this isn't ideal.

  resource_group_name = "${azurerm_resource_group.app_deployment.name}"
  template_body = <<DEPLOY
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "app_service_plan_id": {
      "type": "string",
      "metadata": {
        "description": "App Service Plan ID"
      }
    },
    "name": {
      "type": "string",
      "metadata": {
        "description": "App Name"
      }
    },
    "image": {
      "type": "string",
      "metadata": {
        "description": "Docker image"
      }
    }
  },
  "resources": [
    {
      "apiVersion": "2016-08-01",
      "kind": "app,linux,container",
      "name": "[parameters('name')]",
      "type": "Microsoft.Web/sites",
      "properties": {
        "name": "[parameters('name')]",
        "siteConfig": {
          "alwaysOn": true,
          "appSettings": [
            {
              "name": "WEBSITES_ENABLE_APP_SERVICE_STORAGE",
              "value": "false"
            },
            {
              "name": "WEBSITES_PORT",
              "value": "1337"
            }
          ],
          "linuxFxVersion": "[concat('DOCKER|', parameters('image'))]"
        },
        "serverFarmId": "[parameters('app_service_plan_id')]"
      },
      "location": "[resourceGroup().location]"
    }
  ]
}
DEPLOY

  parameters {
    name = "loconomics-${terraform.workspace}"
    image = "loconomics/loconomics"
    app_service_plan_id = "${azurerm_app_service_plan.plan.id}"
  }

  deployment_mode = "Incremental"
}
