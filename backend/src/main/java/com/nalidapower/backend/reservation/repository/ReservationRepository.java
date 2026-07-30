package com.nalidapower.backend.reservation.repository;

import com.nalidapower.backend.reservation.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
}