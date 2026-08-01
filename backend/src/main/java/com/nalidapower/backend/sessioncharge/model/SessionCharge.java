package com.nalidapower.backend.sessioncharge.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "sessions_charge")
public class SessionCharge {

    @Id
    private String id;

    private String reservationId;

    @Indexed
    private String utilisateurId;

    @Indexed
    private String stationId;

    private String borneIdentifiant;
    private String vehiculeImmatriculation;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private double energieConsommeeKwh;

    private StatutSession statut;
    private OrigineSession origine;

    private LocalDateTime dateCreation;

    public SessionCharge() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
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

    public String getVehiculeImmatriculation() {
        return vehiculeImmatriculation;
    }

    public void setVehiculeImmatriculation(String vehiculeImmatriculation) {
        this.vehiculeImmatriculation = vehiculeImmatriculation;
    }

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public double getEnergieConsommeeKwh() {
        return energieConsommeeKwh;
    }

    public void setEnergieConsommeeKwh(double energieConsommeeKwh) {
        this.energieConsommeeKwh = energieConsommeeKwh;
    }

    public StatutSession getStatut() {
        return statut;
    }

    public void setStatut(StatutSession statut) {
        this.statut = statut;
    }

    public OrigineSession getOrigine() {
        return origine;
    }

    public void setOrigine(OrigineSession origine) {
        this.origine = origine;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}