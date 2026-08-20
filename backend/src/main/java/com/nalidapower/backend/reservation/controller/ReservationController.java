package com.nalidapower.backend.reservation.controller;

import com.nalidapower.backend.reservation.dto.CreerReservationRequest;
import com.nalidapower.backend.reservation.dto.ReservationDetailDTO;
import com.nalidapower.backend.reservation.model.OrigineReservation;
import com.nalidapower.backend.reservation.model.Reservation;
import com.nalidapower.backend.reservation.model.StatutReservation;
import com.nalidapower.backend.reservation.repository.ReservationRepository;
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

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final StationRepository stationRepository;

    public ReservationController(ReservationRepository reservationRepository,
                                 UtilisateurRepository utilisateurRepository,
                                 StationRepository stationRepository) {
        this.reservationRepository = reservationRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.stationRepository = stationRepository;
    }

    /** Vue backoffice : toutes les réservations, tous utilisateurs confondus. */
    @GetMapping
    public List<ReservationDetailDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toDetailDTO)
                .toList();
    }

    /** Vue conducteur : uniquement ses propres réservations. */
    @GetMapping("/mes-reservations")
    public List<ReservationDetailDTO> mesReservations(HttpServletRequest httpRequest) {
        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return List.of();
        }

        return reservationRepository.findByUtilisateurId(utilisateur.getId()).stream()
                .sorted(Comparator.comparing(Reservation::getDateDebut).reversed())
                .map(this::toDetailDTO)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> creerReservation(@RequestBody CreerReservationRequest requete,
                                              HttpServletRequest httpRequest) {

        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non identifié");
        }

        if (requete.getDateDebut() == null || requete.getDateFin() == null
                || !requete.getDateFin().isAfter(requete.getDateDebut())) {
            return ResponseEntity.badRequest().body("Plage horaire invalide");
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
        if (borne.getStatut() != StatutBorne.DISPONIBLE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cette borne n'est plus disponible");
        }

        Reservation reservation = new Reservation();
        reservation.setUtilisateurId(utilisateur.getId());
        reservation.setStationId(station.getId());
        reservation.setBorneIdentifiant(borne.getIdentifiant());
        reservation.setDateDebut(requete.getDateDebut());
        reservation.setDateFin(requete.getDateFin());
        reservation.setStatut(StatutReservation.CONFIRMEE);
        reservation.setOrigine(OrigineReservation.RESERVEE);
        reservation.setDateCreation(LocalDateTime.now());

        Reservation enregistree = reservationRepository.save(reservation);

        borne.setStatut(StatutBorne.RESERVEE);
        stationRepository.save(station);

        return ResponseEntity.status(HttpStatus.CREATED).body(toDetailDTO(enregistree));
    }

    @PostMapping("/{id}/annuler")
    public ResponseEntity<?> annulerReservation(@PathVariable String id, HttpServletRequest httpRequest) {

        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        Optional<Reservation> reservationOpt = reservationRepository.findById(id);

        if (reservationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Réservation introuvable");
        }
        Reservation reservation = reservationOpt.get();

        boolean estAdmin = utilisateur != null && utilisateur.getRole() == RoleUtilisateur.ADMIN;
        boolean estProprietaire = utilisateur != null
                && utilisateur.getId().equals(reservation.getUtilisateurId());

        if (!estAdmin && !estProprietaire) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cette réservation ne vous appartient pas");
        }

        if (reservation.getStatut() == StatutReservation.ANNULEE) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Réservation déjà annulée");
        }

        reservation.setStatut(StatutReservation.ANNULEE);
        reservationRepository.save(reservation);

        // La borne redevient disponible, sauf si une session de charge l'occupe déjà
        stationRepository.findById(reservation.getStationId()).ifPresent(station ->
                station.getBornes().stream()
                        .filter(b -> b.getIdentifiant().equals(reservation.getBorneIdentifiant()))
                        .filter(b -> b.getStatut() == StatutBorne.RESERVEE)
                        .findFirst()
                        .ifPresent(b -> {
                            b.setStatut(StatutBorne.DISPONIBLE);
                            stationRepository.save(station);
                        }));

        return ResponseEntity.ok(toDetailDTO(reservation));
    }

    private ReservationDetailDTO toDetailDTO(Reservation reservation) {
        String clientNom = utilisateurRepository.findById(reservation.getUtilisateurId())
                .map(u -> u.getPrenom() + " " + u.getNom())
                .orElse("Utilisateur inconnu");

        String stationNom = stationRepository.findById(reservation.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        return new ReservationDetailDTO(
                reservation.getId(),
                clientNom,
                stationNom,
                reservation.getBorneIdentifiant(),
                reservation.getDateDebut(),
                reservation.getDateFin(),
                reservation.getStatut(),
                reservation.getOrigine()
        );
    }
}