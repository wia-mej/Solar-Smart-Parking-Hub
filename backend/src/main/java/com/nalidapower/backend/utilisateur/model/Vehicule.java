package com.nalidapower.backend.utilisateur.model;

public class Vehicule {

    private String marque;
    private String modele;
    private String immatriculation;
    private double capaciteBatterieKwh;

    public Vehicule() {
    }

    public Vehicule(String marque, String modele, String immatriculation, double capaciteBatterieKwh) {
        this.marque = marque;
        this.modele = modele;
        this.immatriculation = immatriculation;
        this.capaciteBatterieKwh = capaciteBatterieKwh;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public double getCapaciteBatterieKwh() {
        return capaciteBatterieKwh;
    }

    public void setCapaciteBatterieKwh(double capaciteBatterieKwh) {
        this.capaciteBatterieKwh = capaciteBatterieKwh;
    }
}