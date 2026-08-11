import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReservationService } from '../../core/services/reservation.service';
import { ReservationDetail, StatutReservation } from '../../core/models/reservation.model';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations implements OnInit {
  searchTerm = '';
  statusFilter: StatutReservation | 'all' = 'all';

  reservations: ReservationDetail[] = [];
  loading = true;
  errorMessage: string | null = null;

  statusLabels: Record<StatutReservation, string> = {
    EN_ATTENTE: 'En attente',
    CONFIRMEE: 'Confirmée',
    ANNULEE: 'Annulée',
    TERMINEE: 'Terminée',
  };

  origineLabels: Record<string, string> = {
    RESERVEE: 'Réservée',
    WALK_IN: 'Walk-in',
  };

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = null;

    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations', err);
        this.errorMessage =
          'Impossible de charger les réservations. Vérifiez que le backend est démarré.';
        this.loading = false;
      },
    });
  }

  get filteredReservations(): ReservationDetail[] {
    return this.reservations.filter((r) => {
      const matchesSearch =
        !this.searchTerm ||
        r.clientNom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.stationNom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || r.statut === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get todayCount(): number {
    const today = new Date().toDateString();
    return this.reservations.filter((r) => new Date(r.dateDebut).toDateString() === today)
      .length;
  }

  get confirmedCount(): number {
    return this.reservations.filter((r) => r.statut === 'CONFIRMEE').length;
  }

  get pendingCount(): number {
    return this.reservations.filter((r) => r.statut === 'EN_ATTENTE').length;
  }

  get cancelledCount(): number {
    return this.reservations.filter((r) => r.statut === 'ANNULEE').length;
  }

  setStatusFilter(status: StatutReservation | 'all'): void {
    this.statusFilter = status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}