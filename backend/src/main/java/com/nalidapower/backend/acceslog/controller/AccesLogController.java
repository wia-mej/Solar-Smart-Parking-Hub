package com.nalidapower.backend.acceslog.controller;

import com.nalidapower.backend.acceslog.dto.AccesLogDetailDTO;
import com.nalidapower.backend.acceslog.model.AccesLog;
import com.nalidapower.backend.acceslog.model.ResultatAcces;
import com.nalidapower.backend.acceslog.repository.AccesLogRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/acces-logs")
public class AccesLogController {

    private final AccesLogRepository accesLogRepository;
    private final StationRepository stationRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AccesLogController(AccesLogRepository accesLogRepository,
                              StationRepository stationRepository,
                              UtilisateurRepository utilisateurRepository) {
        this.accesLogRepository = accesLogRepository;
        this.stationRepository = stationRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    public List<AccesLogDetailDTO> getAllAccesLogs() {
        return accesLogRepository.findAll().stream()
                .map(this::toDetailDTO)
                .toList();
    }

    @GetMapping("/echecs")
    public List<AccesLogDetailDTO> getAccesEchecs() {
        return accesLogRepository.findAll().stream()
                .filter(a -> a.getResultat() == ResultatAcces.ECHEC)
                .map(this::toDetailDTO)
                .toList();
    }

    private AccesLogDetailDTO toDetailDTO(AccesLog accesLog) {
        String stationNom = stationRepository.findById(accesLog.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        String utilisateurNom = utilisateurRepository.findById(accesLog.getUtilisateurId())
                .map(u -> u.getPrenom() + " " + u.getNom())
                .orElse("Utilisateur inconnu");

        return new AccesLogDetailDTO(
                accesLog.getId(),
                utilisateurNom,
                stationNom,
                accesLog.getBorneIdentifiant(),
                accesLog.getTypeEvenement(),
                accesLog.getResultat(),
                accesLog.getMessage(),
                accesLog.getTimestamp()
        );
    }
}