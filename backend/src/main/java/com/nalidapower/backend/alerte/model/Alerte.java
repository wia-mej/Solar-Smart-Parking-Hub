package com.nalidapower.backend.alerte.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "alertes")
public class Alerte {

    @Id
    private String id;

    @Indexed
    private String stationId;

    private String borneIdentifiant;

    private TypeAlerte type;
    private NiveauAlerte niveau;

    @Indexed
    private StatutAlerte statut;

    private String message;

    private LocalDateTime dateCreation;
    private LocalDateTime dateResolution;

    public Alerte() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
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

    public LocalDateTime getDateResolution() {
        return dateResolution;
    }

    public void setDateResolution(LocalDateTime dateResolution) {
        this.dateResolution = dateResolution;
    }
}