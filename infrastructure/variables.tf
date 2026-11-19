// Infrastructural variables
variable "product" {
}

variable "raw_product" {
  default = "ccd" // jenkins-library overrides product for PRs and adds e.g. pr-118-ccd
}

variable "component" {
}

variable "env" {
  description = "(Required) The environment in which to deploy the application infrastructure."
}

variable "common_tags" {
  type = map(string)
}

variable "managed_redis_sku_name" {
  description = "SKU to use for managed redis"
  type        = string
  default     = "Balanced_B0"
}

variable "managed_redis_high_availability_enabled" {
  description = "Whether high availablity should be enabled for managed redis"
  type        = bool
  default     = false
}

variable "managed_redis_rdb_backup_frequency" {
  description = "How frequently managed redis database should be backed up"
  type        = string
  default     = "6h"
}

variable "private_dns_subscription_id" {
  description = "Subscription id for managed redis private dns zone"
  type        = string
  default     = "1baf5470-1c3e-40d3-a6f7-74bfbce4b348"
}
