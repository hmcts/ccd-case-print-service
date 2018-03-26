provider "vault" {
  address = "https://vault.reform.hmcts.net:6200"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
}

module "ccd-case-print-service" {
  source = "git@github.com:hmcts/ccd-case-print-service.git"
  product = "${var.product}-${var.microservice}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  is_frontend  = true
  subscription = "${var.subscription}"

  app_settings = {
    // Node specific vars
    USE_CSRF_PROTECTION = "${var.use_csrf_protection}"
    SECURITY_REFERRER_POLICY = "${var.security_referrer_policy}"
    HPKP_MAX_AGE = "${var.hpkp_max_age}"
    HPKP_SHA256S = "${var.hpkp_sha256s}"
    NODE_ENV = "${var.node_env}"
    IDAM_PRINT_SERVICE_KEY = "${var.idam_print_service_key}"
    UV_THREADPOOL_SIZE = "64"
    NODE_CONFIG_DIR = "D:\\home\\site\\wwwroot\\config"
    TS_BASE_URL = "./src/main"

    CASE_DATA_STORE_URL = "${var.case_data_store_url}"
    CASE_DATA_PROBATE_TEMPLATE_URL = "${var.case_data_store_url}"

    // Logging vars
    REFORM_TEAM = "${var.product}"
    REFORM_SERVICE_NAME = "${var.microservice}"
    REFORM_ENVIRONMENT = "${var.env}"

    // Application vars
    // IDAM
    IDAM_API_URL = "${var.idam_api_url}"
    IDAM_AUTHENTICATION_WEB_URL = "${var.authentication_web_url}"
    IDAM_S2S_AUTH = "${var.s2s_url}"

    IDAM_OAUTH2_TOKEN_ENDPOINT = "${var.idam_api_url}/oauth2/token"
    IDAM_OAUTH2_CLIENT_ID = "ccd_gateway"

    IDAM_BASE_URL = "${var.idam_api_url}"
    IDAM_S2S_URL = "${var.s2s_url}"
    IDAM_SERVICE_NAME = "${var.idam_service_name}"
  }
}
