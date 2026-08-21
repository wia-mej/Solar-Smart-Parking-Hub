package com.nalidapower.backend.reservation.dto;

import com.nalidapower.backend.reservation.model.OrigineReservation;
import com.nalidapower.backend.reservation.model.StatutReservation;

import java.time.LocalDateTime;

public class ReservationDetailDTO {

    private String id;
    private String clientNom;
    private String stationNom;
    private String borneIdentifiant;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private StatutReservation statut;
    private OrigineReservation origine;
    private String stationId;

    public ReservationDetailDTO() {
    }

    public ReservationDetailDTO(String id, String clientNom, String stationNom,
                                String borneIdentifiant, LocalDateTime dateDebut,
                                LocalDateTime dateFin, StatutReservation statut,
                                OrigineReservation origine) {
        this.id = id;
        this.clientNom = clientNom;
        this.stationNom = stationNom;
        this.borneIdentifiant = borneIdentifiant;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.statut = statut;
        this.origine = origine;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClientNom() {
        return clientNom;
    }

    public void setClientNom(String clientNom) {
        this.clientNom = clientNom;
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

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
}