output "ccd_case_print_service_endpoint" {
  value = "${module.ccd-case-print-service.gitendpoint}"
}

output "vaultUri" {
  value = "${data.azurerm_key_vault.ccd_shared_key_vault.vault_uri}"
}

output "vaultName" {
  value = "${local.vaultName}"
}
