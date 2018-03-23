// Infrastructural variables
variable "product" {
  default = "ccd"
}

variable "microservice" {
  default = "ccd-case-print-service"
}

variable "location" {
  default = "UK South"
}

variable "env" { }

variable "ilbIp" { }

variable "idam_api_url" {
  default = "http://betaDevBccidamAppLB.reform.hmcts.net"
}

variable "s2s_url" {
  default = "http://betaDevBccidamS2SLB.reform.hmcts.net"
}

variable "authentication_web_url" {
  default = "https://idam-test.dev.ccidam.reform.hmcts.net"
}

variable "subscription" {}

variable "vault_section" {
  default = "test"
}

variable "use_csrf_protection" {
  default = "true"
}

variable "security_referrer_policy" {
  default = "origin"
}

variable "hpkp_max_age" {
  default = "2592000"
}

variable "hpkp_sha256s" {
  default = "[\"replace me\", \"Set proper SHA256s\"]"
}

variable "idam_print_service_key" {
  default = "AAAAAAAAAAAAAAAA"
}

variable "idam_service_name" {
  default = "ccd_ps"
}

variable "node_env" {
  default = "production"
}

variable "case_data_probate_template_url" {
  default = "http://localhost:4104"
}

variable "case_data_store_url" {
  default = "http://localhost:4452"
}
