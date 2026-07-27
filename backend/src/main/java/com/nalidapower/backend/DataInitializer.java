package com.nalidapower.backend;

import com.nalidapower.backend.station.model.*;
import com.nalidapower.backend.station.repository.StationRepository;
import com.nalidapower.backend.utilisateur.model.RoleUtilisateur;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final StationRepository stationRepository;

    public DataInitializer(UtilisateurRepository utilisateurRepository, StationRepository stationRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.stationRepository = stationRepository;
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

        if (stationRepository.count() == 0) {
            Station station = new Station();
            station.setNom("Station Test Casablanca");
            station.setAdresse("123 Avenue Hassan II");
            station.setVille("Casablanca");
            station.setLatitude(33.5731);
            station.setLongitude(-7.5898);
            station.setPuissanceSolaireInstalleeKw(50.0);
            station.setStatut(StatutStation.ACTIVE);

            station.getBornes().add(new Borne("B1", TypeBorne.DC_RAPIDE, 50.0, StatutBorne.DISPONIBLE));
            station.getBornes().add(new Borne("B2", TypeBorne.AC, 22.0, StatutBorne.DISPONIBLE));

            stationRepository.save(station);
            System.out.println(">>> Station test enregistrée avec id : " + station.getId());
        } else {
            System.out.println(">>> Collection stations déjà peuplée, pas d'insertion.");
        }
    }
}