package com.nalidapower.backend.reservation.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    @Indexed
    private String utilisateurId;

    @Indexed
    private String stationId;

    private String borneIdentifiant;
    private String vehiculeImmatriculation;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private StatutReservation statut;
    private OrigineReservation origine;

    private LocalDateTime dateCreation;

    public Reservation() {
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

    public StatutReservation getStatut() {
        return statut;
    }

    public void setStatut(StatutReservation statut) {
        this.statut = statut;
    }

    public OrigineReservation getOrigine() {
        return origine;
    }

    public void setOrigine(OrigineReservation origine) {
        this.origine = origine;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}