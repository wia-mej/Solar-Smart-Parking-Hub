package com.nalidapower.backend.reservation.controller;

import com.nalidapower.backend.reservation.dto.ReservationDetailDTO;
import com.nalidapower.backend.reservation.model.Reservation;
import com.nalidapower.backend.reservation.repository.ReservationRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @GetMapping
    public List<ReservationDetailDTO> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();

        return reservations.stream()
                .map(this::toDetailDTO)
                .toList();
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