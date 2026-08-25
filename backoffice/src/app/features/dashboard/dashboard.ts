import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AlerteService } from '../../core/services/alerte.service';
import { AlerteDetail, NiveauAlerte } from '../../core/models/alerte.model';
import { StationService } from '../../core/services/station.service';
import { Station } from '../../core/models/station.model';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { ProductionEnergieService } from '../../core/services/production-energie.service';
import { PredictionService } from '../../core/services/prediction.service';

interface StatCard {
  icon: 'dollar' | 'users' | 'activity' | 'zap';
  iconBg: 'teal' | 'orange';
  value: string;
  unit?: string;
  label: string;
  badgeText: string;
  badgeUp: boolean;
  badgeNeutral?: boolean; // true = badge informatif, pas de flèche de tendance
}

/** Un point horaire du graphique, ou null si aucune donnée pour cette heure. */
type SerieHoraire = (number | null)[];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  lastUpdatedSeconds = 5;

  stats: StatCard[] = [
    {
      icon: 'dollar',
      iconBg: 'teal',
      value: '—',
      unit: 'DH',
      label: 'Revenus mensuels',
      badgeText: 'Tarifs à définir',
      badgeUp: true,
      badgeNeutral: true,
    },
    {
      icon: 'users',
      iconBg: 'teal',
      value: '—',
      label: 'Abonnés actifs',
      badgeText: 'Temps réel',
      badgeUp: true,
      badgeNeutral: true,
    },
    {
      icon: 'activity',
      iconBg: 'orange',
      value: '—',
      unit: '%',
      label: "Taux d'occupation",
      badgeText: 'Temps réel',
      badgeUp: true,
      badgeNeutral: true,
    },
    {
      icon: 'zap',
      iconBg: 'teal',
      value: '—',
      unit: 'kW',
      label: 'Énergie produite',
      badgeText: 'Bientôt disponible',
      badgeUp: true,
      badgeNeutral: true,
    },
  ];

  occupancy = {
    occupied: 0,
    free: 0,
    broken: 0,
    total: 0,
    percent: 0,
  };

  stations: Station[] = [];

  alertes: AlerteDetail[] = [];
  alertesLoading = true;

  get alertsTotal(): number {
    return this.alertes.length;
  }

  get alertsCritical(): number {
    return this.alertes.filter((a) => a.niveau === 'CRITIQUE').length;
  }

  isCritical(niveau: NiveauAlerte): boolean {
    return niveau === 'CRITIQUE';
  }

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

  realPath = '';
  predictedPath = '';
  areaPath = '';
  chartWidth = 800;
  chartHeight = 300;
  xLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

  donutRadius = 70;
  donutCircumference = 2 * Math.PI * this.donutRadius;
  donutDashArray = '0 ' + this.donutCircumference;

  constructor(
    private alerteService: AlerteService,
    private stationService: StationService,
    private utilisateurService: UtilisateurService,
    private productionEnergieService: ProductionEnergieService,
    private predictionService: PredictionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProductionChart();
    this.loadAlertes();
    this.loadStations();
    this.loadUtilisateurs();
    this.loadProductionEnergie();
  }

  private loadAlertes(): void {
    this.alertesLoading = true;
    this.alerteService.getAlertesActives().subscribe({
      next: (alertes) => {
        this.alertes = alertes;
        this.alertesLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des alertes', err);
        this.alertesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadStations(): void {
    this.stationService.getAllStations().subscribe({
      next: (stations) => {
        this.stations = stations;
        this.computeOccupancy();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stations', err);
        this.cdr.detectChanges();
      },
    });
  }

  private computeOccupancy(): void {
    const bornes = this.stations.flatMap((s) => s.bornes);
    const total = bornes.length;
    const occupied = bornes.filter(
      (b) => b.statut === 'OCCUPEE' || b.statut === 'RESERVEE',
    ).length;
    const free = bornes.filter((b) => b.statut === 'DISPONIBLE').length;
    const broken = bornes.filter((b) => b.statut === 'HORS_SERVICE').length;
    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;

    this.occupancy = { occupied, free, broken, total, percent };
    this.donutDashArray = `${(percent / 100) * this.donutCircumference} ${this.donutCircumference}`;

    const occupationStat = this.stats.find((s) => s.icon === 'activity');
    if (occupationStat) {
      occupationStat.value = String(percent);
    }
  }

  private loadUtilisateurs(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (utilisateurs) => {
        const actifs = utilisateurs.filter((u) => u.abonnementActif).length;
        const usersStat = this.stats.find((s) => s.icon === 'users');
        if (usersStat) {
          usersStat.value = String(actifs);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.cdr.detectChanges();
      },
    });
  }

  private loadProductionEnergie(): void {
    this.productionEnergieService.getAllProductionEnergie().subscribe({
      next: (productions) => {
        if (productions.length > 0) {
          // Production instantanée du réseau : somme de toutes les stations
          // sur le relevé le plus récent.
          const dernierInstant = productions
            .map((p) => new Date(p.timestamp).getTime())
            .reduce((a, b) => Math.max(a, b));

          const totalReseau = productions
            .filter((p) => new Date(p.timestamp).getTime() === dernierInstant)
            .reduce((somme, p) => somme + p.productionKw, 0);

          const energieStat = this.stats.find((s) => s.icon === 'zap');
          if (energieStat) {
            energieStat.value = totalReseau.toFixed(1);
            energieStat.badgeText = 'Temps réel';
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors du chargement de la production d'énergie", err);
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Charge en parallèle les relevés de production et les prédictions du modèle,
   * puis construit le graphique « réelle vs prédite » de la journée en cours.
   */
  private loadProductionChart(): void {
    forkJoin({
      productions: this.productionEnergieService.getAllProductionEnergie(),
      predictions: this.predictionService.getPredictionsProduction(),
    }).subscribe({
      next: ({ productions, predictions }) => {
        const reelles = this.agregerParHeure(
          productions.map((p) => ({ instant: p.timestamp, valeur: p.productionKw })),
        );
        const predites = this.agregerParHeure(
          predictions.map((p) => ({ instant: p.timestampCible, valeur: p.valeurPredite })),
        );

        this.buildProductionChart(reelles, predites);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du graphique de production', err);
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Répartit des mesures sur les 24 heures de la journée en cours, en sommant
   * les stations entre elles. Une heure sans donnée reste à `null` : c'est ce
   * qui permet à la courbe réelle de s'arrêter à l'heure actuelle, tandis que
   * la courbe prédite couvre toute la journée.
   */
  private agregerParHeure(mesures: { instant: string; valeur: number }[]): SerieHoraire {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const finJour = debutJour.getTime() + 24 * 60 * 60 * 1000;

    const totaux: SerieHoraire = Array(24).fill(null);

    for (const mesure of mesures) {
      const date = new Date(mesure.instant);
      const temps = date.getTime();
      if (temps < debutJour.getTime() || temps >= finJour) {
        continue;
      }
      const heure = date.getHours();
      totaux[heure] = (totaux[heure] ?? 0) + mesure.valeur;
    }

    return totaux;
  }

  private buildProductionChart(reelles: SerieHoraire, predites: SerieHoraire): void {
    const padding = 20;

    const valeurs = [...reelles, ...predites].filter((v): v is number => v !== null);
    if (valeurs.length === 0) {
      this.realPath = '';
      this.predictedPath = '';
      this.areaPath = '';
      return;
    }

    const maxValue = Math.max(...valeurs) * 1.1;
    const stepX = this.chartWidth / 23;

    const toPoints = (serie: SerieHoraire) =>
      serie
        .map((valeur, heure) =>
          valeur === null
            ? null
            : {
                x: heure * stepX,
                y: padding + (1 - valeur / maxValue) * (this.chartHeight - padding * 2),
              },
        )
        .filter((point): point is { x: number; y: number } => point !== null);

    const pointsReels = toPoints(reelles);
    const pointsPredits = toPoints(predites);

    this.realPath = this.toSmoothPath(pointsReels);
    this.predictedPath = this.toSmoothPath(pointsPredits);

    // La zone remplie s'arrête au dernier relevé réel, pas au bord du graphique.
    if (pointsReels.length >= 2) {
      const dernier = pointsReels[pointsReels.length - 1];
      const premier = pointsReels[0];
      this.areaPath =
        `${this.realPath} L ${dernier.x} ${this.chartHeight} ` +
        `L ${premier.x} ${this.chartHeight} Z`;
    } else {
      this.areaPath = '';
    }
  }

  private toSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }
}