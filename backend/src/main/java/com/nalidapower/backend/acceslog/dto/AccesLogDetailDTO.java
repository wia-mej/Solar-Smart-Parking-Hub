package com.nalidapower.backend.acceslog.dto;

import com.nalidapower.backend.acceslog.model.ResultatAcces;
import com.nalidapower.backend.acceslog.model.TypeEvenementAcces;

import java.time.LocalDateTime;

public class AccesLogDetailDTO {

    private String id;
    private String utilisateurNom;
    private String stationNom;
    private String borneIdentifiant;
    private TypeEvenementAcces typeEvenement;
    private ResultatAcces resultat;
    private String message;
    private LocalDateTime timestamp;

    public AccesLogDetailDTO() {
    }

    public AccesLogDetailDTO(String id, String utilisateurNom, String stationNom, String borneIdentifiant,
                             TypeEvenementAcces typeEvenement, ResultatAcces resultat,
                             String message, LocalDateTime timestamp) {
        this.id = id;
        this.utilisateurNom = utilisateurNom;
        this.stationNom = stationNom;
        this.borneIdentifiant = borneIdentifiant;
        this.typeEvenement = typeEvenement;
        this.resultat = resultat;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUtilisateurNom() {
        return utilisateurNom;
    }

    public void setUtilisateurNom(String utilisateurNom) {
        this.utilisateurNom = utilisateurNom;
    }

    public String getStationNom() {
        return stationNom;
    }

    public void setStationNom(String stationNom) {
        this.stationNom = stationNom;
    }

    public String getBorneIdentifiant() {
        return borneIdentifiant;
    }

    public void setBorneIdentifiant(String borneIdentifiant) {
        this.borneIdentifiant = borneIdentifiant;
    }

    public TypeEvenementAcces getTypeEvenement() {
        return typeEvenement;
    }

    public void setTypeEvenement(TypeEvenementAcces typeEvenement) {
        this.typeEvenement = typeEvenement;
    }

    public ResultatAcces getResultat() {
        return resultat;
    }

    public void setResultat(ResultatAcces resultat) {
        this.resultat = resultat;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}