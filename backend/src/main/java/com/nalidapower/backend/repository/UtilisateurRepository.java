package com.nalidapower.backend.repository;

import com.nalidapower.backend.model.Utilisateur;
import org.springframework.data.mongodb.repository.MongoRepository;

//SpringData va generer les methodes de bases
public interface UtilisateurRepository extends MongoRepository<Utilisateur, String> {
}
