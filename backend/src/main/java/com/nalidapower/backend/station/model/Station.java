package com.nalidapower.backend.station.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "stations")
public class Station {

    @Id
    private String id;

    private String nom;
    private String adresse;
    private String ville;
    private double latitude;
    private double longitude;
    private double puissanceSolaireInstalleeKw;
    private StatutStation statut;

    private List<Borne> bornes = new ArrayList<>();

    public Station() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public List<Borne> getBornes() {
        return bornes;
    }

    public void setBornes(List<Borne> bornes) {
        this.bornes = bornes;
    }
}