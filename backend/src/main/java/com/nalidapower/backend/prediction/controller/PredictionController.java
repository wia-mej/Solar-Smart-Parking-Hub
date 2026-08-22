package com.nalidapower.backend.prediction.controller;

import com.nalidapower.backend.prediction.dto.PredictionDetailDTO;
import com.nalidapower.backend.prediction.model.Prediction;
import com.nalidapower.backend.prediction.model.TypePrediction;
import com.nalidapower.backend.prediction.repository.PredictionRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nalidapower.backend.prediction.dto.CreneauDTO;
import com.nalidapower.backend.prediction.dto.MeilleurCreneauDTO;
import com.nalidapower.backend.prediction.service.AiServiceClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/predictions")
public class PredictionController {

    private final PredictionRepository predictionRepository;
    private final StationRepository stationRepository;
    private final AiServiceClient aiServiceClient;

    public PredictionController(PredictionRepository predictionRepository,
                                StationRepository stationRepository, AiServiceClient aiServiceClient) {
        this.predictionRepository = predictionRepository;
        this.stationRepository = stationRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @GetMapping
    public List<PredictionDetailDTO> getAllPredictions() {
        return predictionRepository.findAll().stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/production")
    public List<PredictionDetailDTO> getPredictionsProduction() {
        return predictionRepository.findAll().stream()
                .filter(p -> p.getTypePrediction() == TypePrediction.PRODUCTION)
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    private PredictionDetailDTO toDetailDTO(Prediction prediction) {
        String stationNom = stationRepository.findById(prediction.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        return new PredictionDetailDTO(
                prediction.getId(),
                stationNom,
                prediction.getTypePrediction(),
                prediction.getTimestampCible(),
                prediction.getValeurPredite(),
                prediction.getDateGeneration()
        );
    }

    private static final List<String> HUBS_CONNUS =
            List.of("hub_casablanca", "hub_rabat", "hub_tanger", "hub_marrakech");

    /**
     * Interroge le modèle IA pour les 12 prochaines heures et renvoie le créneau
     * où le plus de bornes devraient être libres.
     */
    @GetMapping("/meilleur-creneau")
    public ResponseEntity<?> meilleurCreneau(@RequestParam String ville) {

        String hubId = "hub_" + ville.trim().toLowerCase(Locale.ROOT)
                .replace("é", "e").replace("è", "e").replace("â", "a").replace(" ", "");

        if (!HUBS_CONNUS.contains(hubId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Aucun modèle de prédiction pour la ville : " + ville);
        }

        LocalDateTime depart = LocalDateTime.now().truncatedTo(ChronoUnit.HOURS).plusHours(1);
        List<CreneauDTO> creneaux = new ArrayList<>();

        try {
            for (int i = 0; i < 12; i++) {
                LocalDateTime heure = depart.plusHours(i);
                creneaux.add(new CreneauDTO(heure, aiServiceClient.predireDisponibilite(hubId, heure)));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service de prédiction indisponible");
        }

        // Le meilleur créneau est cherché en priorité aux heures ensoleillées :
        // recommander 1h du matin sur un parking solaire n'aurait aucun sens.
        CreneauDTO meilleur = creneaux.stream()
                .filter(c -> c.heure().getHour() >= 9 && c.heure().getHour() <= 17)
                .max(Comparator.comparingDouble(CreneauDTO::disponibilitePct))
                .orElseGet(() -> creneaux.stream()
                        .max(Comparator.comparingDouble(CreneauDTO::disponibilitePct))
                        .orElse(null));

        return ResponseEntity.ok(new MeilleurCreneauDTO(hubId, meilleur, creneaux));
    }
}