package com.nalidapower.backend.sessioncharge.repository;

import com.nalidapower.backend.sessioncharge.model.SessionCharge;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SessionChargeRepository extends MongoRepository<SessionCharge, String> {

    List<SessionCharge> findByUtilisateurId(String utilisateurId);

}