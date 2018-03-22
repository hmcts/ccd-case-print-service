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
