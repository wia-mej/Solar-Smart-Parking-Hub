package com.nalidapower.backend.alerte.repository;

import com.nalidapower.backend.alerte.model.Alerte;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlerteRepository extends MongoRepository<Alerte, String> {
}