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
import java.util.Optional;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final UtilisateurRepository utilisateurRepository;

    public FirebaseAuthFilter(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
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
            Optional<Utilisateur> utilisateurOpt =
                    utilisateurRepository.findByFirebaseUid(decodedToken.getUid());

            if (utilisateurOpt.isEmpty() || utilisateurOpt.get().getRole() != RoleUtilisateur.ADMIN) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Accès réservé aux administrateurs");
                return;
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalide");
        }
    }
}