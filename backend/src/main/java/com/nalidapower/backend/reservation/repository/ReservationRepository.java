package com.nalidapower.backend.reservation.repository;

import com.nalidapower.backend.reservation.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReservationRepository extends MongoRepository<Reservation, String> {

    List<Reservation> findByUtilisateurId(String utilisateurId);
}