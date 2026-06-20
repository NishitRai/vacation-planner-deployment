# Provision AKS cluster

resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.dns_prefix
  sku_tier            = var.sku_tier

  private_cluster_enabled = true

  default_node_pool {
    name            = "agentpool"
    node_count      = var.node_count
    min_count       = var.min_node_count
    max_count       = var.max_node_count
    vm_size         = var.vm_size
    os_disk_size_gb = 30
    # Bind nodes directly to custom subnet
    vnet_subnet_id  = var.vnet_subnet_id
    auto_scaling_enabled = true
  }

  identity {
    type = "SystemAssigned"
  }

  # Use Azure CNI for advanced private networking
  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform-Module"
    Network     = "Private"
  }
}
