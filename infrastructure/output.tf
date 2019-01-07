output "ccd_case_print_service_endpoint" {
  value = "${module.ccd-case-print-service.gitendpoint}"
}

output "vaultName" {
  value = "${local.vaultName}"
}
