package com.nalidapower.backend.prediction.dto;

import java.time.LocalDateTime;

public record CreneauDTO(LocalDateTime heure, double disponibilitePct) {
}