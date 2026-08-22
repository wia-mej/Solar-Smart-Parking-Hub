package com.nalidapower.backend.prediction.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(@Value("${aiservice.url}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    /** Réponse de POST /predict/disponibilite du service IA. */
    public record ReponseDisponibilite(
            @JsonProperty("hub_id") String hubId,
            @JsonProperty("disponibilite_bornes_predite_pct") double disponibilitePct) {
    }

    public double predireDisponibilite(String hubId, LocalDateTime timestamp) {
        ReponseDisponibilite reponse = restClient.post()
                .uri("/predict/disponibilite")
                .body(Map.of("hub_id", hubId, "timestamp", timestamp.toString()))
                .retrieve()
                .body(ReponseDisponibilite.class);

        return reponse != null ? reponse.disponibilitePct() : 0.0;
    }
}