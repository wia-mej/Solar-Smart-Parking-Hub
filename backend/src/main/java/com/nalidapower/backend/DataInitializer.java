package com.nalidapower.backend;

import com.nalidapower.backend.acceslog.model.AccesLog;
import com.nalidapower.backend.acceslog.model.ResultatAcces;
import com.nalidapower.backend.acceslog.model.TypeEvenementAcces;
import com.nalidapower.backend.acceslog.repository.AccesLogRepository;
import com.nalidapower.backend.productionenergie.model.ProductionEnergie;
import com.nalidapower.backend.productionenergie.model.SourceProduction;
import com.nalidapower.backend.productionenergie.repository.ProductionEnergieRepository;
import com.nalidapower.backend.reservation.model.OrigineReservation;
import com.nalidapower.backend.reservation.model.Reservation;
import com.nalidapower.backend.reservation.model.StatutReservation;
import com.nalidapower.backend.reservation.repository.ReservationRepository;
import com.nalidapower.backend.sessioncharge.model.OrigineSession;
import com.nalidapower.backend.sessioncharge.model.SessionCharge;
import com.nalidapower.backend.sessioncharge.model.StatutSession;
import com.nalidapower.backend.sessioncharge.repository.SessionChargeRepository;
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
    private final ReservationRepository reservationRepository;
    private final SessionChargeRepository sessionChargeRepository;
    private final AccesLogRepository accesLogRepository;
    private final ProductionEnergieRepository productionEnergieRepository;

    public DataInitializer(UtilisateurRepository utilisateurRepository, StationRepository stationRepository, ReservationRepository reservationRepository, SessionChargeRepository sessionChargeRepository, AccesLogRepository accesLogRepository, ProductionEnergieRepository productionEnergieRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.stationRepository = stationRepository;
        this.reservationRepository = reservationRepository;
        this.sessionChargeRepository = sessionChargeRepository;
        this.accesLogRepository = accesLogRepository;
        this.productionEnergieRepository = productionEnergieRepository;
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

        if (reservationRepository.count() == 0) {
            utilisateurRepository.findAll().stream().findFirst().ifPresent(utilisateur ->
                    stationRepository.findAll().stream().findFirst().ifPresent(station -> {
                        Reservation reservation = new Reservation();
                        reservation.setUtilisateurId(utilisateur.getId());
                        reservation.setStationId(station.getId());
                        reservation.setBorneIdentifiant(station.getBornes().get(0).getIdentifiant());
                        reservation.setVehiculeImmatriculation("TEST-1234");
                        reservation.setDateDebut(LocalDateTime.now().plusHours(1));
                        reservation.setDateFin(LocalDateTime.now().plusHours(2));
                        reservation.setStatut(StatutReservation.CONFIRMEE);
                        reservation.setOrigine(OrigineReservation.RESERVEE);
                        reservation.setDateCreation(LocalDateTime.now());

                        reservationRepository.save(reservation);
                        System.out.println(">>> Reservation test enregistrée avec id : " + reservation.getId());
                    })
            );
        } else {
            System.out.println(">>> Collection reservations déjà peuplée, pas d'insertion.");
        }

        if (sessionChargeRepository.count() == 0) {
            utilisateurRepository.findAll().stream().findFirst().ifPresent(utilisateur ->
                    stationRepository.findAll().stream().findFirst().ifPresent(station -> {
                        SessionCharge session = new SessionCharge();
                        session.setUtilisateurId(utilisateur.getId());
                        session.setStationId(station.getId());
                        session.setBorneIdentifiant(station.getBornes().get(0).getIdentifiant());
                        session.setVehiculeImmatriculation("TEST-1234");
                        session.setDateDebut(LocalDateTime.now().minusMinutes(30));
                        session.setDateFin(LocalDateTime.now());
                        session.setEnergieConsommeeKwh(12.5);
                        session.setStatut(StatutSession.TERMINEE);
                        session.setOrigine(OrigineSession.WALK_IN);
                        session.setDateCreation(LocalDateTime.now());

                        sessionChargeRepository.save(session);
                        System.out.println(">>> Session charge test enregistrée avec id : " + session.getId());
                    })
            );
        } else {
            System.out.println(">>> Collection sessions_charge déjà peuplée, pas d'insertion.");
        }

        if (accesLogRepository.count() == 0) {
            utilisateurRepository.findAll().stream().findFirst().ifPresent(utilisateur ->
                    stationRepository.findAll().stream().findFirst().ifPresent(station -> {
                        AccesLog log = new AccesLog();
                        log.setUtilisateurId(utilisateur.getId());
                        log.setStationId(station.getId());
                        log.setBorneIdentifiant(station.getBornes().get(0).getIdentifiant());
                        log.setTypeEvenement(TypeEvenementAcces.DEMARRAGE_SESSION);
                        log.setResultat(ResultatAcces.SUCCES);
                        log.setMessage("Session démarrée avec succès");
                        log.setTimestamp(LocalDateTime.now());

                        accesLogRepository.save(log);
                        System.out.println(">>> Acces log test enregistré avec id : " + log.getId());
                    })
            );
        } else {
            System.out.println(">>> Collection acces_logs déjà peuplée, pas d'insertion.");
        }

        if (productionEnergieRepository.count() == 0) {
            stationRepository.findAll().stream().findFirst().ifPresent(station -> {
                ProductionEnergie production = new ProductionEnergie();
                production.setStationId(station.getId());
                production.setTimestamp(LocalDateTime.now());
                production.setProductionKw(38.4);
                production.setIrradiationWm2(720.0);
                production.setSource(SourceProduction.MESUREE);

                productionEnergieRepository.save(production);
                System.out.println(">>> Production energie test enregistrée avec id : " + production.getId());
            });
        } else {
            System.out.println(">>> Collection production_energie déjà peuplée, pas d'insertion.");
        }
    }
}