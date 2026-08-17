package com.nalidapower.backend.prediction.controller;

import com.nalidapower.backend.prediction.dto.PredictionDetailDTO;
import com.nalidapower.backend.prediction.model.Prediction;
import com.nalidapower.backend.prediction.model.TypePrediction;
import com.nalidapower.backend.prediction.repository.PredictionRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/predictions")
public class PredictionController {

    private final PredictionRepository predictionRepository;
    private final StationRepository stationRepository;

    public PredictionController(PredictionRepository predictionRepository,
                                StationRepository stationRepository) {
        this.predictionRepository = predictionRepository;
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<PredictionDetailDTO> getAllPredictions() {
        return predictionRepository.findAll().stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/production")
    public List<PredictionDetailDTO> getPredictionsProduction() {
        return predictionRepository.findAll().stream()
                .filter(p -> p.getTypePrediction() == TypePrediction.PRODUCTION)
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    private PredictionDetailDTO toDetailDTO(Prediction prediction) {
        String stationNom = stationRepository.findById(prediction.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        return new PredictionDetailDTO(
                prediction.getId(),
                stationNom,
                prediction.getTypePrediction(),
                prediction.getTimestampCible(),
                prediction.getValeurPredite(),
                prediction.getDateGeneration()
        );
    }
}