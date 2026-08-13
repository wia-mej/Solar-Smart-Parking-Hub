package com.nalidapower.backend.alerte.controller;

import com.nalidapower.backend.alerte.dto.AlerteDetailDTO;
import com.nalidapower.backend.alerte.model.Alerte;
import com.nalidapower.backend.alerte.model.StatutAlerte;
import com.nalidapower.backend.alerte.repository.AlerteRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alertes")
public class AlerteController {

    private final AlerteRepository alerteRepository;
    private final StationRepository stationRepository;

    public AlerteController(AlerteRepository alerteRepository,
                            StationRepository stationRepository) {
        this.alerteRepository = alerteRepository;
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<AlerteDetailDTO> getAllAlertes() {
        return alerteRepository.findAll().stream()
                .map(this::toDetailDTO)
                .toList();
    }

    @GetMapping("/actives")
    public List<AlerteDetailDTO> getAlertesActives() {
        return alerteRepository.findAll().stream()
                .filter(a -> a.getStatut() == StatutAlerte.ACTIVE)
                .map(this::toDetailDTO)
                .toList();
    }

    private AlerteDetailDTO toDetailDTO(Alerte alerte) {
        String stationNom = stationRepository.findById(alerte.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        return new AlerteDetailDTO(
                alerte.getId(),
                stationNom,
                alerte.getBorneIdentifiant(),
                alerte.getType(),
                alerte.getNiveau(),
                alerte.getStatut(),
                alerte.getMessage(),
                alerte.getDateCreation()
        );
    }
}