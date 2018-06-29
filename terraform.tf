variable "godaddy_api_key" {}

variable "godaddy_api_secret" {}

provider "godaddy" {
  key = "${var.godaddy_api_key}"
  secret = "${var.godaddy_api_secret}"
}

resource "azurerm_resource_group" "app" {
  name     = "app-${terraform.workspace}"
  location = "West US"
}

resource "azurerm_resource_group" "app_deployment" {
  name     = "app-${terraform.workspace}-deployment"
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
  "variables": {
  },
  "resources": [
    {
      "type": "Microsoft.Web/sites",
      "kind": "app,linux,container",
      "name": "[parameters('name')]",
      "properties": {
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
        "name": "[parameters('name')]",
        "serverFarmId": "[parameters('app_service_plan_id')]"
      },
      "apiVersion": "2016-08-01",
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

resource "godaddy_domain_record" "domain" {
  domain   = "loconomics.com"
  record {
    name = "${terraform.workspace}"
    type = "CNAME"
    data = "loconomics-${terraform.workspace}.azurewebsites.net"
    ttl = 600
  }
}
