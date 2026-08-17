package com.nalidapower.backend.station.controller;

import com.nalidapower.backend.station.dto.CreateStationRequest;
import com.nalidapower.backend.station.model.Borne;
import com.nalidapower.backend.station.model.Station;
import com.nalidapower.backend.station.model.StatutBorne;
import com.nalidapower.backend.station.repository.StationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stations")
public class StationController {

    private final StationRepository stationRepository;

    public StationController(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable String id) {
        return stationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Station> creerStation(@RequestBody CreateStationRequest requete) {
        Station station = new Station();
        station.setNom(requete.getNom());
        station.setAdresse(requete.getAdresse());
        station.setVille(requete.getVille());
        station.setLatitude(requete.getLatitude());
        station.setLongitude(requete.getLongitude());
        station.setPuissanceSolaireInstalleeKw(requete.getPuissanceSolaireInstalleeKw());
        station.setStatut(requete.getStatut());

        List<Borne> bornes = requete.getBornes().stream()
                .map(b -> new Borne(b.getIdentifiant(), b.getType(), b.getPuissanceKw(), StatutBorne.DISPONIBLE))
                .collect(Collectors.toList());
        station.getBornes().addAll(bornes);

        Station stationEnregistree = stationRepository.save(station);
        return ResponseEntity.status(HttpStatus.CREATED).body(stationEnregistree);
    }
}