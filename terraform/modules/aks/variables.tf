variable "resource_group_name" {
  type        = string
  description = "Name of the resource group to deploy into"
}

variable "location" {
  type        = string
  description = "Azure region for the resources"
}

variable "cluster_name" {
  type        = string
  description = "Name of the AKS cluster"
}

variable "dns_prefix" {
  type        = string
  description = "DNS prefix for the cluster"
}

variable "sku_tier" {
  type        = string
  default     = "Free"
  description = "The SKU tier for the AKS control plane (Free or Standard)"
}

variable "node_count" {
  type        = number
  default     = 1
  description = "Initial number of worker nodes"
}

variable "min_node_count" {
  type        = number
  default     = 1
  description = "Minimum number of worker nodes"
}

variable "max_node_count" {
  type        = number
  default     = 2
  description = "Maximum number of worker nodes"
}

variable "vm_size" {
  type        = string
  default     = "Standard_D2s_v6"
  description = "Size of the virtual machines used for worker nodes"
}

variable "vnet_subnet_id" {
    type = string
    description = "The subnet ID where AKS worker nodes and pods will be placed."
}

variable "environment" {
  type        = string
  default     = "Development"
  description = "Value for the Environment tag"
}
