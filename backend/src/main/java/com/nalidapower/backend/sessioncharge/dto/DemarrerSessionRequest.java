package com.nalidapower.backend.sessioncharge.dto;

import com.nalidapower.backend.sessioncharge.model.OrigineSession;

public class DemarrerSessionRequest {

    private String utilisateurId;
    private String stationId;
    private String borneIdentifiant;
    private String vehiculeImmatriculation;
    private OrigineSession origine;
    private String reservationId;

    public DemarrerSessionRequest() {
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

    public OrigineSession getOrigine() {
        return origine;
    }

    public void setOrigine(OrigineSession origine) {
        this.origine = origine;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }
}