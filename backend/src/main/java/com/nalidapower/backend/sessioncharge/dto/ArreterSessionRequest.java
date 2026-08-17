package com.nalidapower.backend.sessioncharge.dto;

public class ArreterSessionRequest {

    private double energieConsommeeKwh;

    public ArreterSessionRequest() {
    }

    public double getEnergieConsommeeKwh() {
        return energieConsommeeKwh;
    }

    public void setEnergieConsommeeKwh(double energieConsommeeKwh) {
        this.energieConsommeeKwh = energieConsommeeKwh;
    }
}