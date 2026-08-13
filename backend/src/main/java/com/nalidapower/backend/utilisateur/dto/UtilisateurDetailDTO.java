package com.nalidapower.backend.utilisateur.dto;

import com.nalidapower.backend.utilisateur.model.RoleUtilisateur;
import com.nalidapower.backend.utilisateur.model.TypeAbonnement;

import java.time.LocalDateTime;

public class UtilisateurDetailDTO {

    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private RoleUtilisateur role;
    private LocalDateTime dateCreation;
    private TypeAbonnement abonnementType;
    private boolean abonnementActif;
    private int nombreVehicules;

    public UtilisateurDetailDTO() {
    }

    public UtilisateurDetailDTO(String id, String nom, String prenom, String email, String telephone,
                                RoleUtilisateur role, LocalDateTime dateCreation,
                                TypeAbonnement abonnementType, boolean abonnementActif,
                                int nombreVehicules) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.role = role;
        this.dateCreation = dateCreation;
        this.abonnementType = abonnementType;
        this.abonnementActif = abonnementActif;
        this.nombreVehicules = nombreVehicules;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public RoleUtilisateur getRole() {
        return role;
    }

    public void setRole(RoleUtilisateur role) {
        this.role = role;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public TypeAbonnement getAbonnementType() {
        return abonnementType;
    }

    public void setAbonnementType(TypeAbonnement abonnementType) {
        this.abonnementType = abonnementType;
    }

    public boolean isAbonnementActif() {
        return abonnementActif;
    }

    public void setAbonnementActif(boolean abonnementActif) {
        this.abonnementActif = abonnementActif;
    }

    public int getNombreVehicules() {
        return nombreVehicules;
    }

    public void setNombreVehicules(int nombreVehicules) {
        this.nombreVehicules = nombreVehicules;
    }
}