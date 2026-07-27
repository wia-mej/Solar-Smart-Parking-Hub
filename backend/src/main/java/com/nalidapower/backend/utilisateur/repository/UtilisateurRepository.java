package com.nalidapower.backend.utilisateur.repository;

import com.nalidapower.backend.utilisateur.model.Utilisateur;
import org.springframework.data.mongodb.repository.MongoRepository;

//SpringData va generer les methodes de bases
public interface UtilisateurRepository extends MongoRepository<Utilisateur, String> {
}
