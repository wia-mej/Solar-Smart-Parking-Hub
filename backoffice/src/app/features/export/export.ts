import { ChangeDetectorRef, Component } from '@angular/core';

import { StationService } from '../../core/services/station.service';
import { ReservationService } from '../../core/services/reservation.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AccesLogService } from '../../core/services/acces-log.service';
import { AlerteService } from '../../core/services/alerte.service';
import { ProductionEnergieService } from '../../core/services/production-energie.service';
import { exportToCsv } from '../../core/utils/csv-export';

interface ExportCard {
  key: string;
  label: string;
  description: string;
  loading: boolean;
}

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [],
  templateUrl: './export.html',
  styleUrl: './export.scss',
})
export class Export {
  cards: ExportCard[] = [
    {
      key: 'stations',
      label: 'Stations & Bornes',
      description: 'Liste des stations et de leurs bornes (une ligne par borne)',
      loading: false,
    },
    {
      key: 'reservations',
      label: 'Réservations',
      description: 'Historique des réservations',
      loading: false,
    },
    {
      key: 'utilisateurs',
      label: 'Utilisateurs',
      description: 'Liste des utilisateurs et de leurs abonnements',
      loading: false,
    },
    {
      key: 'acces',
      label: "Journal d'accès",
      description: "Historique des sessions et tentatives d'accès",
      loading: false,
    },
    {
      key: 'alertes',
      label: 'Alertes',
      description: 'Alertes actives',
      loading: false,
    },
    {
      key: 'production',
      label: "Production d'énergie",
      description: 'Relevés de production solaire',
      loading: false,
    },
  ];

  constructor(
    private stationService: StationService,
    private reservationService: ReservationService,
    private utilisateurService: UtilisateurService,
    private accesLogService: AccesLogService,
    private alerteService: AlerteService,
    private productionEnergieService: ProductionEnergieService,
    private cdr: ChangeDetectorRef,
  ) {}

  export(card: ExportCard): void {
    card.loading = true;
    const today = new Date().toISOString().slice(0, 10);

    switch (card.key) {
      case 'stations':
        this.stationService.getAllStations().subscribe({
          next: (stations) => {
            const rows = stations.flatMap((s) =>
              s.bornes.map((b) => ({
                station: s.nom,
                ville: s.ville,
                adresse: s.adresse,
                statutStation: s.statut,
                borneIdentifiant: b.identifiant,
                borneType: b.type,
                puissanceKw: b.puissanceKw,
                statutBorne: b.statut,
              })),
            );
            this.finish(card, rows, `stations-${today}.csv`);
          },
          error: () => this.fail(card),
        });
        break;

      case 'reservations':
        this.reservationService.getAllReservations().subscribe({
          next: (data) => this.finish(card, data, `reservations-${today}.csv`),
          error: () => this.fail(card),
        });
        break;

      case 'utilisateurs':
        this.utilisateurService.getAllUtilisateurs().subscribe({
          next: (data) => this.finish(card, data, `utilisateurs-${today}.csv`),
          error: () => this.fail(card),
        });
        break;

      case 'acces':
        this.accesLogService.getAllAccesLogs().subscribe({
          next: (data) => this.finish(card, data, `acces-${today}.csv`),
          error: () => this.fail(card),
        });
        break;

      case 'alertes':
        this.alerteService.getAlertesActives().subscribe({
          next: (data) => this.finish(card, data, `alertes-${today}.csv`),
          error: () => this.fail(card),
        });
        break;

      case 'production':
        this.productionEnergieService.getAllProductionEnergie().subscribe({
          next: (data) => this.finish(card, data, `production-energie-${today}.csv`),
          error: () => this.fail(card),
        });
        break;
    }
  }

  private finish(card: ExportCard, data: object[], filename: string): void {    exportToCsv(filename, data);
    card.loading = false;
    this.cdr.detectChanges();
  }

  private fail(card: ExportCard): void {
    console.error(`Erreur lors de l'export de ${card.label}`);
    alert(`Impossible d'exporter ${card.label}. Vérifiez que le backend est démarré.`);
    card.loading = false;
    this.cdr.detectChanges();
  }
}