package com.nalidapower.backend.station.dto;

import com.nalidapower.backend.station.model.StatutStation;

import java.util.List;

public class CreateStationRequest {

    private String nom;
    private String adresse;
    private String ville;
    private double latitude;
    private double longitude;
    private double puissanceSolaireInstalleeKw;
    private StatutStation statut;
    private List<CreateBorneRequest> bornes;

    public CreateStationRequest() {
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getPuissanceSolaireInstalleeKw() {
        return puissanceSolaireInstalleeKw;
    }

    public void setPuissanceSolaireInstalleeKw(double puissanceSolaireInstalleeKw) {
        this.puissanceSolaireInstalleeKw = puissanceSolaireInstalleeKw;
    }

    public StatutStation getStatut() {
        return statut;
    }

    public void setStatut(StatutStation statut) {
        this.statut = statut;
    }

    public List<CreateBorneRequest> getBornes() {
        return bornes;
    }

    public void setBornes(List<CreateBorneRequest> bornes) {
        this.bornes = bornes;
    }
}