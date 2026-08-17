package com.nalidapower.backend.productionenergie.controller;

import com.nalidapower.backend.productionenergie.dto.ProductionEnergieDetailDTO;
import com.nalidapower.backend.productionenergie.model.ProductionEnergie;
import com.nalidapower.backend.productionenergie.repository.ProductionEnergieRepository;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.repository.StationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/production-energie")
public class ProductionEnergieController {

    private final ProductionEnergieRepository productionEnergieRepository;
    private final StationRepository stationRepository;

    public ProductionEnergieController(ProductionEnergieRepository productionEnergieRepository,
                                       StationRepository stationRepository) {
        this.productionEnergieRepository = productionEnergieRepository;
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<ProductionEnergieDetailDTO> getAllProductionEnergie() {
        return productionEnergieRepository.findAll().stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    private ProductionEnergieDetailDTO toDetailDTO(ProductionEnergie production) {
        String stationNom = stationRepository.findById(production.getStationId())
                .map(Station::getNom)
                .orElse("Station inconnue");

        return new ProductionEnergieDetailDTO(
                production.getId(),
                stationNom,
                production.getTimestamp(),
                production.getProductionKw(),
                production.getIrradiationWm2(),
                production.getSource()
        );
    }
}