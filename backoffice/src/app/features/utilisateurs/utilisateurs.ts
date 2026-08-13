import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UtilisateurService } from '../../core/services/utilisateur.service';
import { RoleUtilisateur, UtilisateurDetail } from '../../core/models/utilisateur.model';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.scss',
})
export class Utilisateurs implements OnInit {
  searchTerm = '';
  roleFilter: RoleUtilisateur | 'all' = 'all';

  utilisateurs: UtilisateurDetail[] = [];
  loading = true;
  errorMessage: string | null = null;

  roleLabels: Record<RoleUtilisateur, string> = {
    CONDUCTEUR: 'Conducteur',
    ADMIN: 'Admin',
  };

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.errorMessage = null;

    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.utilisateurs = utilisateurs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.errorMessage =
          'Impossible de charger les utilisateurs. Vérifiez que le backend est démarré.';
        this.loading = false;
      },
    });
  }

  get filteredUtilisateurs(): UtilisateurDetail[] {
    return this.utilisateurs.filter((u) => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        u.nom.toLowerCase().includes(term) ||
        u.prenom.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchesRole = this.roleFilter === 'all' || u.role === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  get totalCount(): number {
    return this.utilisateurs.length;
  }

  get conducteursCount(): number {
    return this.utilisateurs.filter((u) => u.role === 'CONDUCTEUR').length;
  }

  get adminsCount(): number {
    return this.utilisateurs.filter((u) => u.role === 'ADMIN').length;
  }

  get premiumCount(): number {
    return this.utilisateurs.filter((u) => u.abonnementType === 'PREMIUM' && u.abonnementActif)
      .length;
  }

  setRoleFilter(role: RoleUtilisateur | 'all'): void {
    this.roleFilter = role;
  }

  fullName(u: UtilisateurDetail): string {
    return `${u.prenom} ${u.nom}`;
  }

  abonnementLabel(u: UtilisateurDetail): string {
    if (!u.abonnementType) return 'Aucun';
    const label = u.abonnementType === 'PREMIUM' ? 'Premium' : 'Standard';
    return u.abonnementActif ? label : `${label} (inactif)`;
  }

  abonnementClass(u: UtilisateurDetail): string {
    if (!u.abonnementType || !u.abonnementActif) return 'none';
    return u.abonnementType.toLowerCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}