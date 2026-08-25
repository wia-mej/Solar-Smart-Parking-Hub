package com.nalidapower.backend;

import com.nalidapower.backend.prediction.model.Prediction;
import com.nalidapower.backend.prediction.model.TypePrediction;
import com.nalidapower.backend.prediction.repository.PredictionRepository;
import com.nalidapower.backend.productionenergie.model.ProductionEnergie;
import com.nalidapower.backend.productionenergie.model.SourceProduction;
import com.nalidapower.backend.productionenergie.repository.ProductionEnergieRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Génère un historique de production solaire et les prédictions correspondantes.
 *
 * Les capteurs et onduleurs des stations n'étant pas encore installés, ce jeu de
 * données simulé permet d'alimenter le tableau de bord et de comparer une courbe
 * « réelle » à une courbe « prédite », comme le fera l'intégration SolisCloud.
 *
 * Le générateur est idempotent : il ne produit rien si la collection contient
 * déjà des données. Pour régénérer, vider `production_energie` et `predictions`
 * dans MongoDB Atlas.
 */
@Component
@Order(2)
public class DataSimulator implements CommandLineRunner {

    /** Nombre de jours d'historique généré. */
    private static final int JOURS_HISTORIQUE = 7;

    /** Irradiance de référence par ciel dégagé, en W/m². */
    private static final double IRRADIATION_MAX_WM2 = 950;

    /** Rendement global de l'installation : pertes onduleur, câblage, température. */
    private static final double RENDEMENT = 0.80;

    /** Ce que le modèle anticipe faute de connaître la météo du jour. */
    private static final double COUVERTURE_ATTENDUE = 0.85;

    /** Au-delà de ce nombre de relevés, on considère le jeu déjà généré. */
    private static final int SEUIL = 50;

    private final StationRepository stationRepository;
    private final ProductionEnergieRepository productionEnergieRepository;
    private final PredictionRepository predictionRepository;

    public DataSimulator(StationRepository stationRepository,
                         ProductionEnergieRepository productionEnergieRepository,
                         PredictionRepository predictionRepository) {
        this.stationRepository = stationRepository;
        this.productionEnergieRepository = productionEnergieRepository;
        this.predictionRepository = predictionRepository;
    }

    @Override
    public void run(String... args) {
        if (productionEnergieRepository.count() >= SEUIL) {
            System.out.println(">>> Jeu de données simulé déjà présent, pas de régénération.");
            return;
        }

        List<Station> stations = stationRepository.findAll();
        if (stations.isEmpty()) {
            System.out.println(">>> Aucune station en base, simulation ignorée.");
            return;
        }

        // Graine fixe : le jeu généré est reproductible d'une exécution à l'autre.
        Random random = new Random(42);

        LocalDateTime maintenant = LocalDateTime.now();
        LocalDate premierJour = maintenant.toLocalDate().minusDays(JOURS_HISTORIQUE - 1L);

        List<ProductionEnergie> productions = new ArrayList<>();
        List<Prediction> predictions = new ArrayList<>();

        for (Station station : stations) {
            double puissanceCrete = station.getPuissanceSolaireInstalleeKw();
            if (puissanceCrete <= 0) {
                continue;
            }

            for (int jour = 0; jour < JOURS_HISTORIQUE; jour++) {
                LocalDate date = premierJour.plusDays(jour);

                // Météo du jour : entre 55 % et 100 % de l'ensoleillement théorique.
                double couvertureDuJour = 0.55 + random.nextDouble() * 0.45;

                for (int heure = 0; heure < 24; heure++) {
                    LocalDateTime instant = date.atTime(heure, 0);
                    double irradiationCiel = formeSolaire(heure) * IRRADIATION_MAX_WM2;

                    // Prédiction : disponible pour toutes les heures, y compris à venir.
                    double predite = irradiationCiel / 1000.0 * puissanceCrete
                            * RENDEMENT * COUVERTURE_ATTENDUE;
                    predictions.add(creerPrediction(station, instant, arrondi(predite), maintenant));

                    // Relevé réel : seulement pour le passé.
                    if (instant.isAfter(maintenant)) {
                        continue;
                    }

                    double bruit = 1 + (random.nextDouble() - 0.5) * 0.10;
                    double irradiationReelle = irradiationCiel * couvertureDuJour * bruit;
                    double reelle = irradiationReelle / 1000.0 * puissanceCrete * RENDEMENT;

                    productions.add(creerProduction(station, instant,
                            arrondi(reelle), arrondi(irradiationReelle)));
                }
            }
        }

        productionEnergieRepository.saveAll(productions);
        predictionRepository.saveAll(predictions);

        System.out.printf(">>> Jeu simulé : %d relevés de production et %d prédictions sur %d jours.%n",
                productions.size(), predictions.size(), JOURS_HISTORIQUE);
    }

    /** Courbe en cloche : nulle avant 6 h et après 18 h, maximale à midi. */
    private double formeSolaire(int heure) {
        if (heure < 6 || heure > 18) {
            return 0;
        }
        return Math.sin(Math.PI * (heure - 6) / 12.0);
    }

    private ProductionEnergie creerProduction(Station station, LocalDateTime instant,
                                              double productionKw, double irradiation) {
        ProductionEnergie production = new ProductionEnergie();
        production.setStationId(station.getId());
        production.setTimestamp(instant);
        production.setProductionKw(productionKw);
        production.setIrradiationWm2(irradiation);
        production.setSource(SourceProduction.ESTIMEE);
        return production;
    }

    private Prediction creerPrediction(Station station, LocalDateTime cible,
                                       double valeur, LocalDateTime generation) {
        Prediction prediction = new Prediction();
        prediction.setStationId(station.getId());
        prediction.setTypePrediction(TypePrediction.PRODUCTION);
        prediction.setTimestampCible(cible);
        prediction.setValeurPredite(valeur);
        prediction.setDateGeneration(generation);
        return prediction;
    }

    private double arrondi(double valeur) {
        return Math.round(valeur * 1000) / 1000.0;
    }
}