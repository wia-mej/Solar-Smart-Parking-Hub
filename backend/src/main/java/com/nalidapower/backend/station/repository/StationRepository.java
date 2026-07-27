package com.nalidapower.backend.station.repository;

import com.nalidapower.backend.station.model.Station;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StationRepository extends MongoRepository<Station, String> {
}