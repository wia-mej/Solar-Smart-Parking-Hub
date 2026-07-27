package com.nalidapower.backend.station.model;

public class Borne {

    private String identifiant;
    private TypeBorne type;
    private double puissanceKw;
    private StatutBorne statut;

    public Borne() {
    }

    public Borne(String identifiant, TypeBorne type, double puissanceKw, StatutBorne statut) {
        this.identifiant = identifiant;
        this.type = type;
        this.puissanceKw = puissanceKw;
        this.statut = statut;
    }

    public String getIdentifiant() {
        return identifiant;
    }

    public void setIdentifiant(String identifiant) {
        this.identifiant = identifiant;
    }

    public TypeBorne getType() {
        return type;
    }

    public void setType(TypeBorne type) {
        this.type = type;
    }

    public double getPuissanceKw() {
        return puissanceKw;
    }

    public void setPuissanceKw(double puissanceKw) {
        this.puissanceKw = puissanceKw;
    }

    public StatutBorne getStatut() {
        return statut;
    }

    public void setStatut(StatutBorne statut) {
        this.statut = statut;
    }
}