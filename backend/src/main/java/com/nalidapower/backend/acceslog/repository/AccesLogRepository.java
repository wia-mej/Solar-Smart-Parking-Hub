package com.nalidapower.backend.acceslog.repository;

import com.nalidapower.backend.acceslog.model.AccesLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AccesLogRepository extends MongoRepository<AccesLog, String> {
}