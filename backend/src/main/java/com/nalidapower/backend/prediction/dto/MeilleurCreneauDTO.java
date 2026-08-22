package com.nalidapower.backend.prediction.dto;

import java.util.List;

public record MeilleurCreneauDTO(String hubId, CreneauDTO meilleur, List<CreneauDTO> creneaux) {
}