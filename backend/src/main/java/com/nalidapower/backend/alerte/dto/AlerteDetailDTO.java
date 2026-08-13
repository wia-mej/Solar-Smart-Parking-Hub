package com.nalidapower.backend.alerte.dto;

import com.nalidapower.backend.alerte.model.NiveauAlerte;
import com.nalidapower.backend.alerte.model.StatutAlerte;
import com.nalidapower.backend.alerte.model.TypeAlerte;

import java.time.LocalDateTime;

public class AlerteDetailDTO {

    private String id;
    private String stationNom;
    private String borneIdentifiant;
    private TypeAlerte type;
    private NiveauAlerte niveau;
    private StatutAlerte statut;
    private String message;
    private LocalDateTime dateCreation;

    public AlerteDetailDTO() {
    }

    public AlerteDetailDTO(String id, String stationNom, String borneIdentifiant,
                           TypeAlerte type, NiveauAlerte niveau, StatutAlerte statut,
                           String message, LocalDateTime dateCreation) {
        this.id = id;
        this.stationNom = stationNom;
        this.borneIdentifiant = borneIdentifiant;
        this.type = type;
        this.niveau = niveau;
        this.statut = statut;
        this.message = message;
        this.dateCreation = dateCreation;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public TypeAlerte getType() {
        return type;
    }

    public void setType(TypeAlerte type) {
        this.type = type;
    }

    public NiveauAlerte getNiveau() {
        return niveau;
    }

    public void setNiveau(NiveauAlerte niveau) {
        this.niveau = niveau;
    }

    public StatutAlerte getStatut() {
        return statut;
    }

    public void setStatut(StatutAlerte statut) {
        this.statut = statut;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}