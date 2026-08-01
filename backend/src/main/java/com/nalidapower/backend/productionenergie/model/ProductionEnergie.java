package com.nalidapower.backend.productionenergie.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "production_energie")
public class ProductionEnergie {

    @Id
    private String id;

    @Indexed
    private String stationId;

    @Indexed
    private LocalDateTime timestamp;

    private double productionKw;
    private double irradiationWm2;
    private SourceProduction source;

    public ProductionEnergie() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
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