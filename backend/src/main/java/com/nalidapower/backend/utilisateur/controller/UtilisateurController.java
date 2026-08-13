package com.nalidapower.backend.utilisateur.controller;

import com.nalidapower.backend.utilisateur.dto.UtilisateurDetailDTO;
import com.nalidapower.backend.utilisateur.model.TypeAbonnement;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/utilisateurs")
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurController(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    public List<UtilisateurDetailDTO> getAllUtilisateurs() {
        return utilisateurRepository.findAll().stream()
                .map(this::toDetailDTO)
                .toList();
    }

    @GetMapping("/premium")
    public List<UtilisateurDetailDTO> getUtilisateursPremium() {
        return utilisateurRepository.findAll().stream()
                .filter(u -> u.getAbonnement() != null
                        && u.getAbonnement().getType() == TypeAbonnement.PREMIUM
                        && u.getAbonnement().isActif())
                .map(this::toDetailDTO)
                .toList();
    }

    private UtilisateurDetailDTO toDetailDTO(Utilisateur utilisateur) {
        TypeAbonnement abonnementType = utilisateur.getAbonnement() != null
                ? utilisateur.getAbonnement().getType()
                : null;
        boolean abonnementActif = utilisateur.getAbonnement() != null
                && utilisateur.getAbonnement().isActif();
        int nombreVehicules = utilisateur.getVehicules() != null
                ? utilisateur.getVehicules().size()
                : 0;

        return new UtilisateurDetailDTO(
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getEmail(),
                utilisateur.getTelephone(),
                utilisateur.getRole(),
                utilisateur.getDateCreation(),
                abonnementType,
                abonnementActif,
                nombreVehicules
        );
    }
}