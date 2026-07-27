package com.nalidapower.backend;

import com.nalidapower.backend.model.RoleUtilisateur;
import com.nalidapower.backend.model.Utilisateur;
import com.nalidapower.backend.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;

    public DataInitializer(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public void run(String... args) {
        if (utilisateurRepository.count() == 0) {
            Utilisateur test = new Utilisateur();
            test.setNom("Test");
            test.setPrenom("Ecriture");
            test.setEmail("test.ecriture@parkree.dev");
            test.setFirebaseUid("test-uid-001");
            test.setRole(RoleUtilisateur.CONDUCTEUR);
            test.setDateCreation(LocalDateTime.now());

            utilisateurRepository.save(test);
            System.out.println(">>> Utilisateur test enregistré avec id : " + test.getId());
        } else {
            System.out.println(">>> Collection utilisateurs déjà peuplée, pas d'insertion.");
        }
    }
}