package com.nalidapower.backend.repository;

import com.nalidapower.backend.model.Station;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StationRepository extends MongoRepository<Station, String> {
}