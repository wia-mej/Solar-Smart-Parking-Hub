package com.nalidapower.backend.sessioncharge.controller;

import com.nalidapower.backend.sessioncharge.dto.ArreterSessionRequest;
import com.nalidapower.backend.sessioncharge.dto.DemarrerSessionRequest;
import com.nalidapower.backend.sessioncharge.dto.SessionChargeDetailDTO;
import com.nalidapower.backend.sessioncharge.model.OrigineSession;
import com.nalidapower.backend.sessioncharge.model.SessionCharge;
import com.nalidapower.backend.sessioncharge.model.StatutSession;
import com.nalidapower.backend.sessioncharge.repository.SessionChargeRepository;
import com.nalidapower.backend.station.model.Borne;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.model.StatutBorne;
import com.nalidapower.backend.station.repository.StationRepository;
import com.nalidapower.backend.utilisateur.model.RoleUtilisateur;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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

    /** Vue backoffice : toutes les sessions. */
    @GetMapping
    public List<SessionChargeDetailDTO> getAllSessionsCharge() {
        return sessionChargeRepository.findAll().stream()
                .map(this::toDetailDTO)
                .toList();
    }

    /** Vue conducteur : sa session en cours, ou aucun contenu s'il n'en a pas. */
    @GetMapping("/ma-session-en-cours")
    public ResponseEntity<SessionChargeDetailDTO> maSessionEnCours(HttpServletRequest httpRequest) {
        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return ResponseEntity.noContent().build();
        }

        return sessionChargeRepository.findByUtilisateurId(utilisateur.getId()).stream()
                .filter(s -> s.getStatut() == StatutSession.EN_COURS)
                .findFirst()
                .map(s -> ResponseEntity.ok(toDetailDTO(s)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /** Vue conducteur : l'historique de ses sessions, la plus récente en premier. */
    @GetMapping("/mes-sessions")
    public List<SessionChargeDetailDTO> mesSessions(HttpServletRequest httpRequest) {
        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return List.of();
        }

        return sessionChargeRepository.findByUtilisateurId(utilisateur.getId()).stream()
                .sorted(Comparator.comparing(SessionCharge::getDateDebut).reversed())
                .map(this::toDetailDTO)
                .toList();
    }

    @PostMapping("/demarrer")
    public ResponseEntity<?> demarrerSession(@RequestBody DemarrerSessionRequest requete,
                                             HttpServletRequest httpRequest) {

        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non identifié");
        }

        // Un admin peut démarrer une session pour un tiers depuis le backoffice ;
        // un conducteur ne peut la démarrer que pour lui-même.
        String utilisateurId = utilisateur.getRole() == RoleUtilisateur.ADMIN
                && requete.getUtilisateurId() != null
                ? requete.getUtilisateurId()
                : utilisateur.getId();

        boolean dejaEnCours = sessionChargeRepository.findByUtilisateurId(utilisateurId).stream()
                .anyMatch(s -> s.getStatut() == StatutSession.EN_COURS);
        if (dejaEnCours) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Une session est déjà en cours");
        }

        Optional<Station> stationOpt = stationRepository.findById(requete.getStationId());
        if (stationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Station introuvable");
        }
        Station station = stationOpt.get();

        Borne borne = station.getBornes().stream()
                .filter(b -> b.getIdentifiant().equals(requete.getBorneIdentifiant()))
                .findFirst()
                .orElse(null);
        if (borne == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Borne introuvable");
        }

        // Une borne réservée reste démarrable (par celui qui l'a réservée) ;
        // une borne déjà occupée ou hors service, non.
        if (borne.getStatut() == StatutBorne.OCCUPEE || borne.getStatut() == StatutBorne.HORS_SERVICE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cette borne n'est pas disponible");
        }

        borne.setStatut(StatutBorne.OCCUPEE);
        stationRepository.save(station);

        SessionCharge session = new SessionCharge();
        session.setUtilisateurId(utilisateurId);
        session.setStationId(station.getId());
        session.setBorneIdentifiant(borne.getIdentifiant());
        session.setVehiculeImmatriculation(requete.getVehiculeImmatriculation());
        session.setDateDebut(LocalDateTime.now());
        session.setStatut(StatutSession.EN_COURS);
        session.setOrigine(requete.getOrigine() != null ? requete.getOrigine() : OrigineSession.WALK_IN);
        session.setReservationId(requete.getReservationId());
        session.setDateCreation(LocalDateTime.now());

        sessionChargeRepository.save(session);

        return ResponseEntity.status(HttpStatus.CREATED).body(toDetailDTO(session));
    }

    @PostMapping("/{id}/arreter")
    public ResponseEntity<?> arreterSession(@PathVariable String id,
                                            @RequestBody(required = false) ArreterSessionRequest requete,
                                            HttpServletRequest httpRequest) {

        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");

        Optional<SessionCharge> sessionOpt = sessionChargeRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Session introuvable");
        }
        SessionCharge session = sessionOpt.get();

        boolean estAdmin = utilisateur != null && utilisateur.getRole() == RoleUtilisateur.ADMIN;
        boolean estProprietaire = utilisateur != null
                && utilisateur.getId().equals(session.getUtilisateurId());
        if (!estAdmin && !estProprietaire) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cette session ne vous appartient pas");
        }

        if (session.getStatut() != StatutSession.EN_COURS) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cette session est déjà terminée");
        }

        LocalDateTime fin = LocalDateTime.now();
        session.setStatut(StatutSession.TERMINEE);
        session.setDateFin(fin);

        // Si l'appelant ne fournit pas de valeur, l'énergie est estimée à partir de
        // la durée réelle et de la puissance de la borne (les compteurs physiques
        // ne sont pas encore installés sur le terrain).
        double energie = requete != null ? requete.getEnergieConsommeeKwh() : 0;
        if (energie <= 0) {
            double heures = Duration.between(session.getDateDebut(), fin).toSeconds() / 3600.0;
            energie = heures * puissanceBorne(session);
        }
        session.setEnergieConsommeeKwh(Math.round(energie * 100) / 100.0);

        sessionChargeRepository.save(session);

        stationRepository.findById(session.getStationId()).ifPresent(station -> {
            station.getBornes().stream()
                    .filter(b -> b.getIdentifiant().equals(session.getBorneIdentifiant()))
                    .findFirst()
                    .ifPresent(b -> b.setStatut(StatutBorne.DISPONIBLE));
            stationRepository.save(station);
        });

        return ResponseEntity.ok(toDetailDTO(session));
    }

    private double puissanceBorne(SessionCharge session) {
        return stationRepository.findById(session.getStationId())
                .flatMap(station -> station.getBornes().stream()
                        .filter(b -> b.getIdentifiant().equals(session.getBorneIdentifiant()))
                        .findFirst())
                .map(Borne::getPuissanceKw)
                .orElse(0.0);
    }

    private SessionChargeDetailDTO toDetailDTO(SessionCharge session) {
        String utilisateurNom = utilisateurRepository.findById(session.getUtilisateurId())
                .map(u -> u.getPrenom() + " " + u.getNom())
                .orElse("Utilisateur inconnu");

        String stationNom = stationRepository.findById(session.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        SessionChargeDetailDTO dto = new SessionChargeDetailDTO(
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
        dto.setPuissanceKw(puissanceBorne(session));
        return dto;
    }
}