provider "azurerm" {
  features {}
}

data "azurerm_key_vault" "ccd_shared_key_vault" {
  name                = "${var.raw_product}-${var.env}"
  resource_group_name = "${var.raw_product}-shared-${var.env}"
}

data "azurerm_key_vault" "s2s_vault" {
  name                = "s2s-${var.env}"
  resource_group_name = "rpe-service-auth-provider-${var.env}"
}

data "azurerm_key_vault_secret" "idam_service_key" {
  name         = "microservicekey-ccd-ps"
  key_vault_id = data.azurerm_key_vault.s2s_vault.id
}

resource "azurerm_key_vault_secret" "idam_service_secret" {
  name         = "microservicekey-ccd-ps"
  value        = data.azurerm_key_vault_secret.idam_service_key.value
  key_vault_id = data.azurerm_key_vault.ccd_shared_key_vault.id
}
