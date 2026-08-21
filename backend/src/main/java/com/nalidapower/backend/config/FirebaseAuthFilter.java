package com.nalidapower.backend.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.nalidapower.backend.utilisateur.model.RoleUtilisateur;
import com.nalidapower.backend.utilisateur.model.Utilisateur;
import com.nalidapower.backend.utilisateur.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    /** Domaines réservés au backoffice : un conducteur n'a rien à y faire. */
    private static final List<String> PREFIXES_ADMIN = List.of(
            "/api/v1/utilisateurs",
            "/api/v1/alertes",
            "/api/v1/acces-logs",
            "/api/v1/production-energie",
            "/api/v1/predictions"
    );

        /** Seule route où le jeton est valide alors que l'utilisateur métier n'existe pas encore. */
    private static final String ROUTE_INSCRIPTION = "/api/v1/utilisateurs/inscription";

    private final UtilisateurRepository utilisateurRepository;

    public FirebaseAuthFilter(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    /** Les endpoints de supervision sont interrogés par Prometheus, qui n'a pas de jeton. */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Les requêtes préliminaires CORS du navigateur n'envoient pas de jeton, on les laisse passer
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token manquant");
            return;
        }

        String idToken = authHeader.substring("Bearer ".length());

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                        // Inscription d'un conducteur : le compte Firebase vient d'être créé côté app,
            // l'utilisateur métier n'existe pas encore — c'est justement l'objet de la requête.
            if (ROUTE_INSCRIPTION.equals(request.getRequestURI())) {
                request.setAttribute("firebaseUid", decodedToken.getUid());
                request.setAttribute("firebaseEmail", decodedToken.getEmail());
                filterChain.doFilter(request, response);
                return;
            }
            Optional<Utilisateur> utilisateurOpt =
                    utilisateurRepository.findByFirebaseUid(decodedToken.getUid());

            // Le jeton est valide, mais aucun utilisateur métier ne lui correspond
            if (utilisateurOpt.isEmpty()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Compte inconnu");
                return;
            }

            Utilisateur utilisateur = utilisateurOpt.get();

            if (estReserveAdmin(request) && utilisateur.getRole() != RoleUtilisateur.ADMIN) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Accès réservé aux administrateurs");
                return;
            }

            // Mis à disposition des contrôleurs, pour identifier l'auteur de la requête
            request.setAttribute("utilisateur", utilisateur);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalide");
        }
    }

    private boolean estReserveAdmin(HttpServletRequest request) {
        String uri = request.getRequestURI();

        // Chacun gère son propre compte (profil, abonnement)
        if (uri.startsWith("/api/v1/utilisateurs/moi")) {
            return false;
        }

        // La recommandation de créneau est destinée aux conducteurs
        if (uri.startsWith("/api/v1/predictions/meilleur-creneau")) {
            return false;
        }

        if (PREFIXES_ADMIN.stream().anyMatch(uri::startsWith)) {
            return true;
        }

        // La liste complète des réservations est une vue backoffice ;
        // un conducteur passe par /mes-reservations, qui ne renvoie que les siennes
        if ("/api/v1/reservations".equals(uri) && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Idem pour la liste complète des sessions de charge
        if ("/api/v1/sessions-charge".equals(uri) && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Les stations sont consultables par tous, mais seul le backoffice peut les modifier
        return uri.startsWith("/api/v1/stations") && !"GET".equalsIgnoreCase(request.getMethod());
    }
}