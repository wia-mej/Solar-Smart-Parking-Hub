package com.nalidapower.backend.reservation.dto;

import java.time.LocalDateTime;

public class CreerReservationRequest {

    private String stationId;
    private String borneIdentifiant;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getBorneIdentifiant() { return borneIdentifiant; }
    public void setBorneIdentifiant(String borneIdentifiant) { this.borneIdentifiant = borneIdentifiant; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }
}