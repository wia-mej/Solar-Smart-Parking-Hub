package com.nalidapower.backend.station.dto;

import com.nalidapower.backend.station.model.TypeBorne;

public class CreateBorneRequest {

    private String identifiant;
    private TypeBorne type;
    private double puissanceKw;

    public CreateBorneRequest() {
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
}