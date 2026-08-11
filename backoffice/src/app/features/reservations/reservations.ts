import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type StatutReservation = 'CONFIRMEE' | 'EN_ATTENTE' | 'ANNULEE' | 'TERMINEE';
type OrigineReservation = 'RESERVEE' | 'WALK_IN';

interface Reservation {
  id: string;
  client: string;
  station: string;
  borne: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: StatutReservation;
  origine: OrigineReservation;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations {
  searchTerm = '';
  statusFilter: StatutReservation | 'all' = 'all';

  statusLabels: Record<StatutReservation, string> = {
    CONFIRMEE: 'Confirmée',
    EN_ATTENTE: 'En attente',
    ANNULEE: 'Annulée',
    TERMINEE: 'Terminée',
  };

  origineLabels: Record<OrigineReservation, string> = {
    RESERVEE: 'Réservée',
    WALK_IN: 'Walk-in',
  };

  reservations: Reservation[] = [
    {
      id: 'r1',
      client: 'Yassine El Amrani',
      station: 'Station Casablanca Centre',
      borne: 'B1',
      date: '2026-08-05',
      heureDebut: '09:00',
      heureFin: '10:30',
      statut: 'CONFIRMEE',
      origine: 'RESERVEE',
    },
    {
      id: 'r2',
      client: 'Sara Bennani',
      station: 'Station Rabat Agdal',
      borne: 'B3',
      date: '2026-08-05',
      heureDebut: '11:00',
      heureFin: '12:00',
      statut: 'EN_ATTENTE',
      origine: 'RESERVEE',
    },
    {
      id: 'r3',
      client: 'Karim Ouazzani',
      station: 'Station Casablanca Centre',
      borne: 'B2',
      date: '2026-08-04',
      heureDebut: '14:00',
      heureFin: '15:00',
      statut: 'TERMINEE',
      origine: 'WALK_IN',
    },
    {
      id: 'r4',
      client: 'Amina Tazi',
      station: 'Station Marrakech Guéliz',
      borne: 'B1',
      date: '2026-08-04',
      heureDebut: '16:30',
      heureFin: '17:30',
      statut: 'ANNULEE',
      origine: 'RESERVEE',
    },
    {
      id: 'r5',
      client: 'Omar Fassi',
      station: 'Station Rabat Agdal',
      borne: 'B2',
      date: '2026-08-06',
      heureDebut: '08:00',
      heureFin: '09:00',
      statut: 'CONFIRMEE',
      origine: 'WALK_IN',
    },
  ];

  get filteredReservations(): Reservation[] {
    return this.reservations.filter((r) => {
      const matchesSearch =
        !this.searchTerm ||
        r.client.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.station.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || r.statut === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get todayCount(): number {
    return this.reservations.filter((r) => r.date === '2026-08-05').length;
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
}