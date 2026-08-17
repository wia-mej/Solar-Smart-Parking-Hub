package com.nalidapower.backend.productionenergie.dto;

import com.nalidapower.backend.productionenergie.model.SourceProduction;

import java.time.LocalDateTime;

public class ProductionEnergieDetailDTO {

    private String id;
    private String stationNom;
    private LocalDateTime timestamp;
    private double productionKw;
    private double irradiationWm2;
    private SourceProduction source;

    public ProductionEnergieDetailDTO() {
    }

    public ProductionEnergieDetailDTO(String id, String stationNom, LocalDateTime timestamp,
                                      double productionKw, double irradiationWm2, SourceProduction source) {
        this.id = id;
        this.stationNom = stationNom;
        this.timestamp = timestamp;
        this.productionKw = productionKw;
        this.irradiationWm2 = irradiationWm2;
        this.source = source;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStationNom() {
        return stationNom;
    }

    public void setStationNom(String stationNom) {
        this.stationNom = stationNom;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public double getProductionKw() {
        return productionKw;
    }

    public void setProductionKw(double productionKw) {
        this.productionKw = productionKw;
    }

    public double getIrradiationWm2() {
        return irradiationWm2;
    }

    public void setIrradiationWm2(double irradiationWm2) {
        this.irradiationWm2 = irradiationWm2;
    }

    public SourceProduction getSource() {
        return source;
    }

    public void setSource(SourceProduction source) {
        this.source = source;
    }
}