output "ip_controle" {
  value = azurerm_public_ip.noeud["controle"].ip_address
}

output "ip_charge" {
  value = azurerm_public_ip.noeud["charge"].ip_address
}

output "inventaire_ansible" {
  value = <<-INV
    [controle]
    ${azurerm_public_ip.noeud["controle"].ip_address} adresse_privee=10.0.1.10

    [charge]
    ${azurerm_public_ip.noeud["charge"].ip_address} adresse_privee=10.0.1.11

    [cluster:children]
    controle
    charge

    [cluster:vars]
    ansible_user=${var.utilisateur}
    ansible_ssh_private_key_file=~/.ssh/id_ed25519
  INV
}
