variable "abonnement" {
  type        = string
  description = "Identifiant de l'abonnement Azure."
}

variable "groupe" {
  type    = string
  default = "SolarHub-cluster"
}

variable "region" {
  type    = string
  default = "swedencentral"
}

variable "utilisateur" {
  type        = string
  default     = "wiame"
  description = "Compte administrateur des machines. C'est ce nom qui apparait dans l'invite SSH."
}

variable "chemin_cle_publique" {
  type    = string
  default = "~/.ssh/id_ed25519.pub"
}

variable "adresse_administration" {
  type        = string
  description = "Adresse publique de ton poste, en notation CIDR. Restreint SSH et le serveur d'API."

  validation {
    condition     = var.adresse_administration != "0.0.0.0/0"
    error_message = "L'acces d'administration ne peut pas etre ouvert a Internet."
  }
}

variable "taille_controle" {
  type    = string
  default = "Standard_B2as_v2"
}

variable "taille_charge" {
  type    = string
  default = "Standard_B2as_v2"
}

variable "marqueurs" {
  type = map(string)
  default = {
    projet      = "Solar Smart Parking Hub"
    environment = "demonstration"
  }
}
