package com.nalidapower.backend.acceslog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "acces_logs")
public class AccesLog {

    @Id
    private String id;

    @Indexed
    private String utilisateurId;

    private String stationId;
    private String borneIdentifiant;

    private TypeEvenementAcces typeEvenement;
    private ResultatAcces resultat;
    private String message;

    @Indexed
    private LocalDateTime timestamp;

    public AccesLog() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(String utilisateurId) {
        this.utilisateurId = utilisateurId;
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