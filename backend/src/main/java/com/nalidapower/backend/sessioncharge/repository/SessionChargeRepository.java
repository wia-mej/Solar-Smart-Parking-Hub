package com.nalidapower.backend.sessioncharge.repository;

import com.nalidapower.backend.sessioncharge.model.SessionCharge;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SessionChargeRepository extends MongoRepository<SessionCharge, String> {
}