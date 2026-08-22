package com.nalidapower.backend.utilisateur.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.nalidapower.backend.utilisateur.dto.AdminCreeDTO;
import com.nalidapower.backend.utilisateur.dto.CreateAdminRequest;
import com.nalidapower.backend.utilisateur.dto.CreateUtilisateurRequest;
import com.nalidapower.backend.utilisateur.dto.UtilisateurDetailDTO;
import com.nalidapower.backend.utilisateur.model.RoleUtilisateur;
import com.nalidapower.backend.utilisateur.model.TypeAbonnement;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nalidapower.backend.utilisateur.dto.InscriptionConducteurRequest;
import jakarta.servlet.http.HttpServletRequest;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import com.nalidapower.backend.utilisateur.dto.SouscrireAbonnementRequest;
import com.nalidapower.backend.utilisateur.model.Abonnement;

import java.time.LocalDate;
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

    @PostMapping
    public ResponseEntity<UtilisateurDetailDTO> creerUtilisateur(@RequestBody CreateUtilisateurRequest requete) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(requete.getNom());
        utilisateur.setPrenom(requete.getPrenom());
        utilisateur.setEmail(requete.getEmail());
        utilisateur.setTelephone(requete.getTelephone());
        utilisateur.setRole(requete.getRole());
        utilisateur.setFirebaseUid(requete.getFirebaseUid());
        utilisateur.setDateCreation(LocalDateTime.now());

        Utilisateur utilisateurEnregistre = utilisateurRepository.save(utilisateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDetailDTO(utilisateurEnregistre));
    }

    @PostMapping("/admin")
    public ResponseEntity<?> creerAdministrateur(@RequestBody CreateAdminRequest requete) {
        UserRecord firebaseUser;
        String lienDefinitionMotDePasse;

        try {
            UserRecord.CreateRequest firebaseRequest = new UserRecord.CreateRequest()
                    .setEmail(requete.getEmail())
                    .setPassword(genererMotDePasseAleatoireJetable())
                    .setDisplayName(requete.getPrenom() + " " + requete.getNom());

            firebaseUser = FirebaseAuth.getInstance().createUser(firebaseRequest);
            lienDefinitionMotDePasse = FirebaseAuth.getInstance().generatePasswordResetLink(requete.getEmail());
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Impossible de créer le compte Firebase : " + e.getMessage());
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(requete.getNom());
        utilisateur.setPrenom(requete.getPrenom());
        utilisateur.setEmail(requete.getEmail());
        utilisateur.setTelephone(requete.getTelephone());
        utilisateur.setRole(RoleUtilisateur.ADMIN);
        utilisateur.setFirebaseUid(firebaseUser.getUid());
        utilisateur.setDateCreation(LocalDateTime.now());

        Utilisateur utilisateurEnregistre = utilisateurRepository.save(utilisateur);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AdminCreeDTO(toDetailDTO(utilisateurEnregistre), lienDefinitionMotDePasse));
    }

        @PostMapping("/inscription")
    public ResponseEntity<?> inscrireConducteur(@RequestBody InscriptionConducteurRequest requete,
                                                HttpServletRequest httpRequest) {

        String firebaseUid = (String) httpRequest.getAttribute("firebaseUid");
        String email = (String) httpRequest.getAttribute("firebaseEmail");

        if (firebaseUid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Jeton Firebase manquant");
        }

        if (utilisateurRepository.findByFirebaseUid(firebaseUid).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ce compte est déjà inscrit");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(requete.getNom());
        utilisateur.setPrenom(requete.getPrenom());
        utilisateur.setEmail(email);
        utilisateur.setTelephone(requete.getTelephone());
        utilisateur.setRole(RoleUtilisateur.CONDUCTEUR);
        utilisateur.setFirebaseUid(firebaseUid);
        utilisateur.setDateCreation(LocalDateTime.now());

        Utilisateur enregistre = utilisateurRepository.save(utilisateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDetailDTO(enregistre));
    }

    /** Le profil métier de la personne authentifiée, quel que soit son rôle. */
    @GetMapping("/moi")
    public ResponseEntity<?> monProfil(HttpServletRequest httpRequest) {
        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non identifié");
        }
        return ResponseEntity.ok(toDetailDTO(utilisateur));
    }

    /** Souscription (ou changement) de formule d'abonnement pour le compte connecté. */
    @PostMapping("/moi/abonnement")
    public ResponseEntity<?> souscrireAbonnement(@RequestBody SouscrireAbonnementRequest requete,
                                                 HttpServletRequest httpRequest) {

        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non identifié");
        }
        if (requete.getType() == null) {
            return ResponseEntity.badRequest().body("Formule d'abonnement manquante");
        }

        Abonnement abonnement = new Abonnement();
        abonnement.setType(requete.getType());
        abonnement.setDateDebut(LocalDate.now());
        abonnement.setDateFin(LocalDate.now().plusMonths(1));
        abonnement.setActif(true);

        utilisateur.setAbonnement(abonnement);
        Utilisateur enregistre = utilisateurRepository.save(utilisateur);

        return ResponseEntity.ok(toDetailDTO(enregistre));
    }

    /** Résiliation : l'abonnement reste en base mais devient inactif. */
    @PostMapping("/moi/abonnement/resilier")
    public ResponseEntity<?> resilierAbonnement(HttpServletRequest httpRequest) {

        Utilisateur utilisateur = (Utilisateur) httpRequest.getAttribute("utilisateur");
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non identifié");
        }
        if (utilisateur.getAbonnement() == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Aucun abonnement à résilier");
        }

        utilisateur.getAbonnement().setActif(false);
        Utilisateur enregistre = utilisateurRepository.save(utilisateur);

        return ResponseEntity.ok(toDetailDTO(enregistre));
    }

    private String genererMotDePasseAleatoireJetable() {
        String caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder motDePasse = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            motDePasse.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }
        return motDePasse.toString();
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