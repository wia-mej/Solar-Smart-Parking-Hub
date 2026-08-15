import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AlerteService } from '../../core/services/alerte.service';
import { AlerteDetail, NiveauAlerte, TypeAlerte } from '../../core/models/alerte.model';
import { AccesLogService } from '../../core/services/acces-log.service';
import { AccesLogDetail, ResultatAcces, TypeEvenementAcces } from '../../core/models/acces-log.model';
import { SessionChargeService } from '../../core/services/session-charge.service';
import {
  OrigineSession,
  SessionChargeDetail,
  StatutSession,
} from '../../core/models/session-charge.model';

type Tab = 'alertes' | 'acces' | 'sessions';

@Component({
  selector: 'app-alertes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './alertes.html',
  styleUrl: './alertes.scss',
})
export class Alertes implements OnInit {
  activeTab: Tab = 'alertes';
  searchTerm = '';

  // --- Alertes ---
  niveauFilter: NiveauAlerte | 'all' = 'all';

  alertes: AlerteDetail[] = [];
  loading = true;
  errorMessage: string | null = null;

  niveauLabels: Record<NiveauAlerte, string> = {
    INFO: 'Info',
    AVERTISSEMENT: 'Avertissement',
    CRITIQUE: 'Critique',
  };

  typeLabels: Record<TypeAlerte, string> = {
    SEUIL_PRODUCTION_BAS: 'Production basse',
    BORNE_HORS_SERVICE: 'Borne hors service',
    MAINTENANCE_REQUISE: 'Maintenance requise',
    ANOMALIE_CAPTEUR: 'Anomalie capteur',
  };

  // --- Accès ---
  resultatFilter: ResultatAcces | 'all' = 'all';

  accesLogs: AccesLogDetail[] = [];
  accesLoading = true;
  accesErrorMessage: string | null = null;

  typeEvenementLabels: Record<TypeEvenementAcces, string> = {
    DEMARRAGE_SESSION: 'Démarrage session',
    ARRET_SESSION: 'Arrêt session',
    TENTATIVE_ACCES: "Tentative d'accès",
  };

  resultatLabels: Record<ResultatAcces, string> = {
    SUCCES: 'Succès',
    ECHEC: 'Échec',
  };

  // --- Sessions de charge ---
  statutSessionFilter: StatutSession | 'all' = 'all';

  sessionsCharge: SessionChargeDetail[] = [];
  sessionsLoading = true;
  sessionsErrorMessage: string | null = null;

  statutSessionLabels: Record<StatutSession, string> = {
    EN_COURS: 'En cours',
    TERMINEE: 'Terminée',
    INTERROMPUE: 'Interrompue',
  };

  origineSessionLabels: Record<OrigineSession, string> = {
    RESERVEE: 'Réservée',
    WALK_IN: 'Walk-in',
  };

  constructor(
    private alerteService: AlerteService,
    private accesLogService: AccesLogService,
    private sessionChargeService: SessionChargeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAlertes();
    this.loadAccesLogs();
    this.loadSessionsCharge();
  }

  setActiveTab(tab: Tab): void {
    this.activeTab = tab;
    this.searchTerm = '';
  }

  // --- Alertes : chargement et filtrage ---

  loadAlertes(): void {
    this.loading = true;
    this.errorMessage = null;

    this.alerteService.getAlertesActives().subscribe({
      next: (alertes) => {
        this.alertes = alertes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des alertes', err);
        this.errorMessage =
          'Impossible de charger les alertes. Vérifiez que le backend est démarré.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredAlertes(): AlerteDetail[] {
    return this.alertes.filter((a) => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        a.stationNom.toLowerCase().includes(term) ||
        a.borneIdentifiant.toLowerCase().includes(term) ||
        a.message.toLowerCase().includes(term);
      const matchesNiveau = this.niveauFilter === 'all' || a.niveau === this.niveauFilter;
      return matchesSearch && matchesNiveau;
    });
  }

  get totalCount(): number {
    return this.alertes.length;
  }

  get criticalCount(): number {
    return this.alertes.filter((a) => a.niveau === 'CRITIQUE').length;
  }

  get warningCount(): number {
    return this.alertes.filter((a) => a.niveau === 'AVERTISSEMENT').length;
  }

  get infoCount(): number {
    return this.alertes.filter((a) => a.niveau === 'INFO').length;
  }

  setNiveauFilter(niveau: NiveauAlerte | 'all'): void {
    this.niveauFilter = niveau;
  }

  // --- Accès : chargement et filtrage ---

  loadAccesLogs(): void {
    this.accesLoading = true;
    this.accesErrorMessage = null;

    this.accesLogService.getAllAccesLogs().subscribe({
      next: (logs) => {
        this.accesLogs = logs;
        this.accesLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors du chargement du journal d'accès", err);
        this.accesErrorMessage =
          "Impossible de charger le journal d'accès. Vérifiez que le backend est démarré.";
        this.accesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredAccesLogs(): AccesLogDetail[] {
    return this.accesLogs.filter((a) => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        a.stationNom.toLowerCase().includes(term) ||
        a.borneIdentifiant.toLowerCase().includes(term) ||
        a.utilisateurNom.toLowerCase().includes(term);
      const matchesResultat = this.resultatFilter === 'all' || a.resultat === this.resultatFilter;
      return matchesSearch && matchesResultat;
    });
  }

  get accesTotalCount(): number {
    return this.accesLogs.length;
  }

  get accesSuccesCount(): number {
    return this.accesLogs.filter((a) => a.resultat === 'SUCCES').length;
  }

  get accesEchecsCount(): number {
    return this.accesLogs.filter((a) => a.resultat === 'ECHEC').length;
  }

  setResultatFilter(resultat: ResultatAcces | 'all'): void {
    this.resultatFilter = resultat;
  }

  // --- Sessions de charge : chargement et filtrage ---

  loadSessionsCharge(): void {
    this.sessionsLoading = true;
    this.sessionsErrorMessage = null;

    this.sessionChargeService.getAllSessionsCharge().subscribe({
      next: (sessions) => {
        this.sessionsCharge = sessions;
        this.sessionsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sessions de charge', err);
        this.sessionsErrorMessage =
          'Impossible de charger les sessions de charge. Vérifiez que le backend est démarré.';
        this.sessionsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredSessionsCharge(): SessionChargeDetail[] {
    return this.sessionsCharge.filter((s) => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        s.stationNom.toLowerCase().includes(term) ||
        s.borneIdentifiant.toLowerCase().includes(term) ||
        s.utilisateurNom.toLowerCase().includes(term);
      const matchesStatut =
        this.statutSessionFilter === 'all' || s.statut === this.statutSessionFilter;
      return matchesSearch && matchesStatut;
    });
  }

  get sessionsTotalCount(): number {
    return this.sessionsCharge.length;
  }

  get sessionsEnCoursCount(): number {
    return this.sessionsCharge.filter((s) => s.statut === 'EN_COURS').length;
  }

  get sessionsTermineesCount(): number {
    return this.sessionsCharge.filter((s) => s.statut === 'TERMINEE').length;
  }

  setStatutSessionFilter(statut: StatutSession | 'all'): void {
    this.statutSessionFilter = statut;
  }

  // --- Partagé ---

  timeAgo(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
  }
}