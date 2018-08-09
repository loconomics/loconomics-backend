variable "sql_server_password" {}

terraform {
  backend "azurerm" {
    storage_account_name = "lctfstate"
    container_name       = "tfstate"
    key        = "prod.terraform.tfstate"
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
  name     = "loconomics-${terraform.workspace}"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  version  = "12.0"
  administrator_login= "loconomics"
  administrator_login_password = "${random_string.sql_server_password.result}"
}

resource "azurerm_sql_firewall_rule" "nolan_home" {
  name      = "NolanHome"
  resource_group_name = "${azurerm_resource_group.app.name}"
  server_name = "${azurerm_sql_server.sql_server.name}"
  start_ip_address    = "70.0.0.0"
  end_ip_address      = "71.0.0.0"
}

resource "azurerm_sql_database" "sql_server_database" {
  name      = "Dev"
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
    linux_fx_version = "DOCKER|loconomics/loconomics:${terraform.workspace}"
    use_32_bit_worker_process = true
  }
  app_settings {
    WEBSITES_PORT = "1337"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    MSSQLSERVER_USER = "${azurerm_sql_server.sql_server.administrator_login}"
    MSSQLSERVER_PASSWORD = "${azurerm_sql_server.sql_server.administrator_login_password}"
    MSSQLSERVER_HOST = "${azurerm_sql_server.sql_server.fully_qualified_domain_name}"
    MSSQLSERVER_DATABASE = "Dev"
    LOCONOMICS_BACKEND_URL = "https://dev.loconomics.com"
  }
  depends_on = [
    "azurerm_sql_database.sql_server_database",
  ]
}

resource "azurerm_public_ip" "ip" {
  name     = "ip"
  location = "${azurerm_resource_group.app.location}"
  resource_group_name = "${azurerm_resource_group.app.name}"
  public_ip_address_allocation = "dynamic"
}

resource "azurerm_virtual_network" "vnet" {
  name = "vnet"
  resource_group_name = "${azurerm_resource_group.app.name}"
  address_space = ["10.254.0.0/16"]
  location = "${azurerm_resource_group.app.location}"
}

resource "azurerm_subnet" "subnet" {
  name = "subnet1"
  resource_group_name = "${azurerm_resource_group.app.name}"
  virtual_network_name = "${azurerm_virtual_network.vnet.name}"
  address_prefix = "10.254.0.0/24"
}

resource "azurerm_application_gateway" "gateway" {
  name = "gateway"
  resource_group_name = "${azurerm_resource_group.app.name}"
  location = "${azurerm_resource_group.app.location}"
  sku {
    name = "Standard_Small"
    tier = "Standard"
    capacity = 1
  }
  gateway_ip_configuration {
    name = "ip-configuration"
    subnet_id = "${azurerm_virtual_network.vnet.id}/subnets/${azurerm_subnet.subnet.name}"
  }

  frontend_ip_configuration {
    name = "${azurerm_virtual_network.vnet.name}-ip"
    public_ip_address_id = "${azurerm_public_ip.ip.id}"
  }

  frontend_port {
    name = "${azurerm_virtual_network.vnet.name}-port"
    port = 80
  }

  http_listener {
    name = "${azurerm_virtual_network.vnet.name}-http-listener2"
    frontend_ip_configuration_name = "${azurerm_virtual_network.vnet.name}-ip"
    frontend_port_name = "${azurerm_virtual_network.vnet.name}-port"
    protocol = "Http"
  }

  backend_address_pool {
    name = "${azurerm_virtual_network.vnet.name}-root-pool"
    fqdn_list = ["dev.loconomics.com"]
  }

  backend_address_pool {
    name = "${azurerm_virtual_network.vnet.name}-api-pool"
    fqdn_list = ["${azurerm_app_service.app.name}.azurewebsites.net"]
  }

  backend_address_pool {
    name = "${azurerm_virtual_network.vnet.name}-pages-pool"
    fqdn_list = ["loconomics-pages.azurewebsites.net"]
  }

  request_routing_rule {
    name = "${azurerm_virtual_network.vnet.name}-rule"
    rule_type = "PathBasedRouting"
    http_listener_name = "${azurerm_virtual_network.vnet.name}-http-listener2"
    url_path_map_name = "paths"
  }

  probe {
    name                = "probe"
    protocol            = "Https"
    path                = "/api"
    host                = "loconomics-${terraform.workspace}.azurewebsites.net"
    timeout             = 120
    interval            = 300
    unhealthy_threshold = 8
  }

  backend_http_settings {
    name = "${azurerm_virtual_network.vnet.name}-backend-http-settings"
    cookie_based_affinity = "Disabled"
    port = 443
    protocol = "Https"
    request_timeout = 1
    probe_name = "probe"
  }

  probe {
    name                = "pages-probe"
    protocol            = "Https"
    path                = "/pages/"
    host                = "loconomics-pages.azurewebsites.net"
    timeout             = 120
    interval            = 300
    unhealthy_threshold = 8
  }

  backend_http_settings {
    name = "${azurerm_virtual_network.vnet.name}-pages-http-settings"
    cookie_based_affinity = "Disabled"
    port = 443
    protocol = "Https"
    request_timeout = 1
    probe_name = "pages-probe"
  }

  url_path_map {
    name = "paths"
    default_backend_address_pool_name = "${azurerm_virtual_network.vnet.name}-root-pool"
    default_backend_http_settings_name = "${azurerm_virtual_network.vnet.name}-backend-http-settings"
    path_rule {
      name = "api"
      paths = ["/api/*"]
      backend_address_pool_name = "${azurerm_virtual_network.vnet.name}-api-pool"
      backend_http_settings_name = "${azurerm_virtual_network.vnet.name}-backend-http-settings"
    }
    path_rule {
      name = "pages"
      paths = ["/pages/*"]
      backend_address_pool_name = "${azurerm_virtual_network.vnet.name}-pages-pool"
      backend_http_settings_name = "${azurerm_virtual_network.vnet.name}-pages-http-settings"
    }
  }

}

data "azurerm_public_ip" "ip" {
  name                = "${azurerm_public_ip.ip.name}"
  resource_group_name = "${azurerm_resource_group.app.name}"
}

output "ip_address" {
  value = "${data.azurerm_public_ip.ip.ip_address}"
}
