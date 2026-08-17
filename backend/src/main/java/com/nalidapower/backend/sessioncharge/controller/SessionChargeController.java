package com.nalidapower.backend.sessioncharge.controller;

import com.nalidapower.backend.sessioncharge.dto.ArreterSessionRequest;
import com.nalidapower.backend.sessioncharge.dto.DemarrerSessionRequest;
import com.nalidapower.backend.sessioncharge.dto.SessionChargeDetailDTO;
import com.nalidapower.backend.sessioncharge.model.SessionCharge;
import com.nalidapower.backend.sessioncharge.model.StatutSession;
import com.nalidapower.backend.sessioncharge.repository.SessionChargeRepository;
import com.nalidapower.backend.station.model.Borne;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.model.StatutBorne;
import com.nalidapower.backend.station.repository.StationRepository;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions-charge")
public class SessionChargeController {

    private final SessionChargeRepository sessionChargeRepository;
    private final StationRepository stationRepository;
    private final UtilisateurRepository utilisateurRepository;

    public SessionChargeController(SessionChargeRepository sessionChargeRepository,
                                   StationRepository stationRepository,
                                   UtilisateurRepository utilisateurRepository) {
        this.sessionChargeRepository = sessionChargeRepository;
        this.stationRepository = stationRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    public List<SessionChargeDetailDTO> getAllSessionsCharge() {
        return sessionChargeRepository.findAll().stream()
                .map(this::toDetailDTO)
                .toList();
    }

    @PostMapping("/demarrer")
    public SessionChargeDetailDTO demarrerSession(@RequestBody DemarrerSessionRequest requete) {
        Station station = stationRepository.findById(requete.getStationId())
                .orElseThrow(() -> new IllegalArgumentException("Station introuvable"));

        Borne borne = station.getBornes().stream()
                .filter(b -> b.getIdentifiant().equals(requete.getBorneIdentifiant()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Borne introuvable"));

        borne.setStatut(StatutBorne.OCCUPEE);
        stationRepository.save(station);

        SessionCharge session = new SessionCharge();
        session.setUtilisateurId(requete.getUtilisateurId());
        session.setStationId(requete.getStationId());
        session.setBorneIdentifiant(requete.getBorneIdentifiant());
        session.setVehiculeImmatriculation(requete.getVehiculeImmatriculation());
        session.setDateDebut(LocalDateTime.now());
        session.setStatut(StatutSession.EN_COURS);
        session.setOrigine(requete.getOrigine());
        session.setReservationId(requete.getReservationId());
        session.setDateCreation(LocalDateTime.now());

        sessionChargeRepository.save(session);

        return toDetailDTO(session);
    }

    @PostMapping("/{id}/arreter")
    public SessionChargeDetailDTO arreterSession(@PathVariable String id, @RequestBody ArreterSessionRequest requete) {
        SessionCharge session = sessionChargeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session introuvable"));

        session.setStatut(StatutSession.TERMINEE);
        session.setDateFin(LocalDateTime.now());
        session.setEnergieConsommeeKwh(requete.getEnergieConsommeeKwh());
        sessionChargeRepository.save(session);

        stationRepository.findById(session.getStationId()).ifPresent(station -> {
            station.getBornes().stream()
                    .filter(b -> b.getIdentifiant().equals(session.getBorneIdentifiant()))
                    .findFirst()
                    .ifPresent(b -> b.setStatut(StatutBorne.DISPONIBLE));
            stationRepository.save(station);
        });

        return toDetailDTO(session);
    }

    private SessionChargeDetailDTO toDetailDTO(SessionCharge session) {
        String utilisateurNom = utilisateurRepository.findById(session.getUtilisateurId())
                .map(u -> u.getPrenom() + " " + u.getNom())
                .orElse("Utilisateur inconnu");

        String stationNom = stationRepository.findById(session.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        return new SessionChargeDetailDTO(
                session.getId(),
                utilisateurNom,
                stationNom,
                session.getBorneIdentifiant(),
                session.getVehiculeImmatriculation(),
                session.getDateDebut(),
                session.getDateFin(),
                session.getEnergieConsommeeKwh(),
                session.getStatut(),
                session.getOrigine()
        );
    }
}