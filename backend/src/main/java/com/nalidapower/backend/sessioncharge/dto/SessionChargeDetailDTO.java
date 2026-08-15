package com.nalidapower.backend.sessioncharge.dto;

import com.nalidapower.backend.sessioncharge.model.OrigineSession;
import com.nalidapower.backend.sessioncharge.model.StatutSession;

import java.time.LocalDateTime;

public class SessionChargeDetailDTO {

    private String id;
    private String utilisateurNom;
    private String stationNom;
    private String borneIdentifiant;
    private String vehiculeImmatriculation;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private double energieConsommeeKwh;
    private StatutSession statut;
    private OrigineSession origine;

    public SessionChargeDetailDTO() {
    }

    public SessionChargeDetailDTO(String id, String utilisateurNom, String stationNom, String borneIdentifiant,
                                  String vehiculeImmatriculation, LocalDateTime dateDebut, LocalDateTime dateFin,
                                  double energieConsommeeKwh, StatutSession statut, OrigineSession origine) {
        this.id = id;
        this.utilisateurNom = utilisateurNom;
        this.stationNom = stationNom;
        this.borneIdentifiant = borneIdentifiant;
        this.vehiculeImmatriculation = vehiculeImmatriculation;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.energieConsommeeKwh = energieConsommeeKwh;
        this.statut = statut;
        this.origine = origine;
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
}