resource "azurerm_resource_group" "dev_rg" {
  name     = "rg-aks-can-east"
  location = "canadaeast"
}

# Create the Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-dev-aks"
  address_space       = ["192.168.0.0/16"]
  location            = azurerm_resource_group.dev_rg.location
  resource_group_name = azurerm_resource_group.dev_rg.name
}

# Subnet dedicated for the Private AKS Nodes & Pods
resource "azurerm_subnet" "aks_subnet" {
  name                 = "snet-aks-nodes"
  resource_group_name  = azurerm_resource_group.dev_rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["192.168.0.0/22"]
}

# Subnet dedicated for the Jumpbox VM management node
resource "azurerm_subnet" "jumpbox_subnet" {
  name                 = "snet-jumpbox"
  resource_group_name  = azurerm_resource_group.dev_rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["192.168.4.0/22"]
}

# Instantiate the custom AKS module
module "vaplan_aks_cluster" {
  source = "./modules/aks" # Points to modules folder

  # Map root data to module inputs
  resource_group_name = azurerm_resource_group.dev_rg.name
  location            = azurerm_resource_group.dev_rg.location
  
  cluster_name = "vaplan-aks-dev"
  dns_prefix   = "vaplan-aks-dns"
  environment  = "Development"

  # Network setting
  vnet_subnet_id      = azurerm_subnet.aks_subnet.id

  sku_tier   = "Free"
  vm_size    = "Standard_D2s_v6"
  node_count = 1
}

# 5. Create a Secure Management Jumpbox to access the Cluster
resource "azurerm_public_ip" "jumpbox_pip" {
  name                = "pip-jumpbox"
  location            = azurerm_resource_group.dev_rg.location
  resource_group_name = azurerm_resource_group.dev_rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_interface" "jumpbox_nic" {
  name                = "nic-jumpbox"
  location            = azurerm_resource_group.dev_rg.location
  resource_group_name = azurerm_resource_group.dev_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.jumpbox_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.jumpbox_pip.id
  }
}

# Create the Network Security Group and the Port 22 Rule
resource "azurerm_network_security_group" "jumpbox_subnet_nsg" {
  name                = "nsg-backend-dev-001"
  location            = azurerm_resource_group.dev_rg.location
  resource_group_name = azurerm_resource_group.dev_rg.name

  # Security rule allowing inbound SSH traffic
  security_rule {
    name                       = "Allow-SSH-Inbound"
    priority                   = 1000 # Lower numbers take precedence
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22" # Target SSH Port
    source_address_prefix      = var.my_ssh_ip  # Allows connections from anywhere on the internet
    destination_address_prefix = "*"
  }
}

# Attach the NSG to the subnet
resource "azurerm_subnet_network_security_group_association" "jumpbox_nsg_assoc" {
  subnet_id                 = azurerm_subnet.jumpbox_subnet.id
  network_security_group_id = azurerm_network_security_group.jumpbox_subnet_nsg.id

  lifecycle {
    create_before_destroy = true
  }
}

resource "azurerm_linux_virtual_machine" "jumpbox" {
  name                = "vm-aks-jumpbox"
  resource_group_name = azurerm_resource_group.dev_rg.name
  location            = azurerm_resource_group.dev_rg.location
  size                = "Standard_B2ats_v2" 
  admin_username      = "azureuser"
  network_interface_ids = [
    azurerm_network_interface.jumpbox_nic.id,
  ]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub") # Assumes you have a local public key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  # Install kubectl and azure cli
  user_data = base64encode(<<-EOF
              #!/bin/bash
              # Update and Install Azure CLI dependencies
              sudo apt-get update
              sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release -y
              
              sudo mkdir -p /etc/apt/keyrings
              curl -sLS https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/microsoft.gpg > /dev/null
              sudo chmod go+r /etc/apt/keyrings/microsoft.gpg

              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/azure-cli.list
              sudo apt-get update && sudo apt-get install -y azure-cli

              # Install kubectl
              sudo az aks install-cli
              EOF
  )
}