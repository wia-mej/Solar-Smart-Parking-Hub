package com.nalidapower.backend.utilisateur.dto;

public class AdminCreeDTO {

    private UtilisateurDetailDTO utilisateur;
    private String lienDefinitionMotDePasse;

    public AdminCreeDTO() {
    }

    public AdminCreeDTO(UtilisateurDetailDTO utilisateur, String lienDefinitionMotDePasse) {
        this.utilisateur = utilisateur;
        this.lienDefinitionMotDePasse = lienDefinitionMotDePasse;
    }

    public UtilisateurDetailDTO getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(UtilisateurDetailDTO utilisateur) {
        this.utilisateur = utilisateur;
    }

    public String getLienDefinitionMotDePasse() {
        return lienDefinitionMotDePasse;
    }

    public void setLienDefinitionMotDePasse(String lienDefinitionMotDePasse) {
        this.lienDefinitionMotDePasse = lienDefinitionMotDePasse;
    }
}