package com.nalidapower.backend.prediction.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "predictions")
public class Prediction {

    @Id
    private String id;

    @Indexed
    private String stationId;

    @Indexed
    private TypePrediction typePrediction;

    private LocalDateTime timestampCible;
    private double valeurPredite;
    private LocalDateTime dateGeneration;

    public Prediction() {
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

    public TypePrediction getTypePrediction() {
        return typePrediction;
    }

    public void setTypePrediction(TypePrediction typePrediction) {
        this.typePrediction = typePrediction;
    }

    public LocalDateTime getTimestampCible() {
        return timestampCible;
    }

    public void setTimestampCible(LocalDateTime timestampCible) {
        this.timestampCible = timestampCible;
    }

    public double getValeurPredite() {
        return valeurPredite;
    }

    public void setValeurPredite(double valeurPredite) {
        this.valeurPredite = valeurPredite;
    }

    public LocalDateTime getDateGeneration() {
        return dateGeneration;
    }

    public void setDateGeneration(LocalDateTime dateGeneration) {
        this.dateGeneration = dateGeneration;
    }
}