variable "sql_server_password" {}

terraform {
  backend "azurerm" {
    storage_account_name = "lctfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}

resource "azurerm_resource_group" "app" {
  name = "app-${terraform.workspace}"
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
  name                = "Dev"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  server_name = "${azurerm_sql_server.sql_server.name}"
  depends_on = [
    "azurerm_sql_firewall_rule.nolan_home",
  ]
  provisioner "local-exec" {
    command = "mssql-scripter -U dev-loconomis -P ${var.sql_server_password} -S dev-loconomics.database.windows.net -d Dev --target-server-version AzureDB >dev.sql"
  }
  provisioner "local-exec" {
    command = "sqlcmd -S ${azurerm_sql_server.sql_server.fully_qualified_domain_name} -U ${azurerm_sql_server.sql_server.administrator_login} -P ${azurerm_sql_server.sql_server.administrator_login_password} -d Dev -i dev.sql"
  }
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
  properties {
    reserved = true
  }
}

resource "azurerm_app_service" "app" {
  name = "loconomics-${terraform.workspace}"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  app_service_plan_id = "${azurerm_app_service_plan.plan.id}"
  site_config {
    always_on = true
    linux_fx_version = "DOCKER|loconomics/loconomics"
  }
  app_settings {
    WEBSITES_PORT = "1337"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    MSSQLSERVER_USER = "${azurerm_sql_server.sql_server.administrator_login}"
    MSSQLSERVER_PASSWORD = "${azurerm_sql_server.sql_server.administrator_login_password}"
    MSSQLSERVER_HOST = "${azurerm_sql_server.sql_server.fully_qualified_domain_name}"
    MSSQLSERVER_DATABASE = "Dev"
  }
}
