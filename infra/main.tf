variable "webapp_name" {
  default = "vocwebapp"
}

variable "db_name" {
  default = "VocDB"
}

variable "collection_name" {
  default = "VocValue"
}

variable "atlas_org_id" {
  type = string
}

variable "mongodbatlas_public_key" {
  type = string
}

variable "mongodbatlas_private_key" {
  type = string
}

variable "atlas_dbuser" {
  default = "voc-app-user"
}

# providers
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.0"
    }
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
  }

  backend "azurerm" {
    resource_group_name  = "tfstatevocapp"
    storage_account_name = "vocappstorage"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

provider "mongodbatlas" {
  public_key  = var.mongodbatlas_public_key
  private_key = var.mongodbatlas_private_key
}

# mongodb atlas

resource "mongodbatlas_project" "atlas_project" {
  name   = "voc-app"
  org_id = var.atlas_org_id
}

resource "mongodbatlas_cluster" "cluster-atlas" {
  project_id   = mongodbatlas_project.atlas_project.id
  name         = "shared-cluster"
  cluster_type = "REPLICASET"

  mongo_db_major_version = "5.0"

  # Provider Settings "block"
  provider_name               = "TENANT"
  backing_provider_name       = "AZURE"
  provider_instance_size_name = "M0"
  provider_region_name        = "EUROPE_NORTH"
}

resource "random_password" "atlas_dbpassword" {
  length  = 16
  special = false
}

resource "mongodbatlas_database_user" "voc-app-user" {
  username = var.atlas_dbuser
  password = random_password.atlas_dbpassword.result

  auth_database_name = "admin"
  project_id         = mongodbatlas_project.atlas_project.id

  roles {
    role_name     = "readWrite"
    database_name = var.db_name
  }
  depends_on = [mongodbatlas_project.atlas_project]
}

resource "azurerm_resource_group" "vocappgroup" {
  name     = "VocAppGroup"
  location = "westeurope"
}

resource "azurerm_cosmosdb_account" "cosmosaccount" {
  name                 = "vocappcosmosaccount"
  location             = azurerm_resource_group.vocappgroup.location
  resource_group_name  = azurerm_resource_group.vocappgroup.name
  kind                 = "MongoDB"
  mongo_server_version = "4.0"

  consistency_policy {
    consistency_level = "Session"
  }

  capabilities {
    name = "EnableServerless"
  }

  capabilities {
    name = "EnableMongo"
  }

  geo_location {
    location          = azurerm_resource_group.vocappgroup.location
    failover_priority = 0
  }

  backup {
    type                = "Periodic"
    interval_in_minutes = 1440
    retention_in_hours  = 48
  }

  offer_type = "Standard"
  # enable_free_tier = true
}

resource "azurerm_cosmosdb_mongo_database" "cosmosdb" {
  name                = var.db_name
  resource_group_name = azurerm_resource_group.vocappgroup.name
  account_name        = azurerm_cosmosdb_account.cosmosaccount.name
}

resource "azurerm_cosmosdb_mongo_collection" "cosmoscollection" {
  name                = var.collection_name
  resource_group_name = azurerm_resource_group.vocappgroup.name
  account_name        = azurerm_cosmosdb_account.cosmosaccount.name
  database_name       = azurerm_cosmosdb_mongo_database.cosmosdb.name

  index {
    keys   = ["_id"]
    unique = true
  }
}

resource "azurerm_application_insights" "vocappappinsights" {
  name                = "vocapp-appinsights"
  location            = azurerm_resource_group.vocappgroup.location
  resource_group_name = azurerm_resource_group.vocappgroup.name
  application_type    = "web"
}

resource "azurerm_application_insights_web_test" "vocappwebtest" {
  name                    = "vocapp-appinsights-webtest"
  location                = azurerm_resource_group.vocappgroup.location
  resource_group_name     = azurerm_resource_group.vocappgroup.name
  application_insights_id = azurerm_application_insights.vocappappinsights.id
  kind                    = "ping"
  frequency               = 300
  timeout                 = 120
  enabled                 = true
  geo_locations           = ["emea-nl-ams-azr", "emea-gb-db3-azr"]

  configuration = <<XML
<WebTest Name="Health Check ping" Id="45E9A843-3A90-456C-A402-A44E94CA66C3" Enabled="True" CssProjectStructure="" CssIteration="" Timeout="120" WorkItemIds="" xmlns="http://microsoft.com/schemas/VisualStudio/TeamTest/2010" Description="" CredentialUserName="" CredentialPassword="" PreAuthenticate="True" Proxy="default" StopOnError="False" RecordedResultFile="" ResultsLocale="">
  <Items>
    <Request Method="GET" Guid="fbb64104-508e-4494-b994-2e1f4cd8c8fd" Version="1.1" Url="https://${var.webapp_name}.azurewebsites.net/api/healthcheck" ThinkTime="0" Timeout="120" ParseDependentRequests="False" FollowRedirects="True" RecordResult="True" Cache="False" ResponseTimeGoal="0" Encoding="utf-8" ExpectedHttpStatusCode="200" ExpectedResponseUrl="" ReportingName="" IgnoreHttpStatusCode="False" />
  </Items>
</WebTest>
  XML
}

resource "azurerm_app_service_plan" "vocapp" {
  name                = "vocwebapp-plan"
  location            = azurerm_resource_group.vocappgroup.location
  resource_group_name = azurerm_resource_group.vocappgroup.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Free"
    size = "F1"
  }
}

locals {
  con = split("?", azurerm_cosmosdb_account.cosmosaccount.connection_strings[0])
}

locals {
  con_parts = split("://", mongodbatlas_cluster.cluster-atlas.srv_address)
  atlas_connection = format("%s://%s:%s@%s/%s?%s",
    local.con_parts[0],
    mongodbatlas_database_user.voc-app-user.username,
    mongodbatlas_database_user.voc-app-user.password,
    local.con_parts[1],
    var.db_name,
  "retryWrites=true&w=majority")
}

resource "azurerm_app_service" "vocappservice" {
  name                = var.webapp_name
  location            = azurerm_resource_group.vocappgroup.location
  resource_group_name = azurerm_resource_group.vocappgroup.name
  app_service_plan_id = azurerm_app_service_plan.vocapp.id
  https_only          = true

  app_settings = {
    "DeployDate"                      = timestamp()
    "DATABASE_URL"                    = format("%s%s?%s", local.con[0], var.db_name, local.con[1])
    "MongoSettings__ConnectionString" = azurerm_cosmosdb_account.cosmosaccount.connection_strings[0]
    "MongoSettings__DatabaseName"     = var.db_name
    "MongoSettings__CollectionName"   = var.collection_name
    "ATLAS_DATABASE_URL"              = local.atlas_connection
  }

  site_config {
    linux_fx_version          = "NODE|16-lts"
    use_32_bit_worker_process = true
    app_command_line          = "node ./packaged/server.js"
  }
}

resource "mongodbatlas_project_ip_access_list" "appservice_atlas_ip" {
  for_each = {
    for key, value in azurerm_app_service.vocappservice.outbound_ip_address_list : key => value
  }
  project_id = mongodbatlas_project.atlas_project.id
  ip_address = each.value
  comment    = "App service IP address"
}
