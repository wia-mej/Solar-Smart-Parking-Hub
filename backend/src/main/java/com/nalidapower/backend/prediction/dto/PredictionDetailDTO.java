package com.nalidapower.backend.prediction.dto;

import com.nalidapower.backend.prediction.model.TypePrediction;

import java.time.LocalDateTime;

public class PredictionDetailDTO {

    private String id;
    private String stationNom;
    private TypePrediction typePrediction;
    private LocalDateTime timestampCible;
    private double valeurPredite;
    private LocalDateTime dateGeneration;

    public PredictionDetailDTO() {
    }

    public PredictionDetailDTO(String id, String stationNom, TypePrediction typePrediction,
                               LocalDateTime timestampCible, double valeurPredite, LocalDateTime dateGeneration) {
        this.id = id;
        this.stationNom = stationNom;
        this.typePrediction = typePrediction;
        this.timestampCible = timestampCible;
        this.valeurPredite = valeurPredite;
        this.dateGeneration = dateGeneration;
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