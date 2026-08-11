import { Injectable } from '@angular/core';

export interface Station {
  id: string;
  nom: string;
  ville: string;
  statut: 'ACTIVE' | 'MAINTENANCE' | 'HORS_SERVICE';
  puissanceSolaireKw: number;
  productionActuelleKw: number;
  bornes: Borne[];
}

export interface Borne {
  identifiant: string;
  type: 'AC' | 'DC_RAPIDE';
  statut: 'DISPONIBLE' | 'OCCUPEE' | 'HORS_SERVICE' | 'RESERVEE';
}

export interface Reservation {
  id: string;
  utilisateur: string;
  station: string;
  borne: string;
  dateDebut: string;
  dateFin: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE';
  origine: 'RESERVEE' | 'WALK_IN';
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  getStations(): Station[] {
    return [
      {
        id: '1', nom: 'Station Casablanca Centre', ville: 'Casablanca',
        statut: 'ACTIVE', puissanceSolaireKw: 50, productionActuelleKw: 38.4,
        bornes: [
          { identifiant: 'B1', type: 'DC_RAPIDE', statut: 'OCCUPEE' },
          { identifiant: 'B2', type: 'AC', statut: 'DISPONIBLE' },
        ],
      },
      {
        id: '2', nom: 'Station Rabat Agdal', ville: 'Rabat',
        statut: 'ACTIVE', puissanceSolaireKw: 34.2, productionActuelleKw: 21.7,
        bornes: [
          { identifiant: 'B1', type: 'AC', statut: 'DISPONIBLE' },
          { identifiant: 'B2', type: 'AC', statut: 'RESERVEE' },
        ],
      },
      {
        id: '3', nom: 'Station Tanger Med', ville: 'Tanger',
        statut: 'MAINTENANCE', puissanceSolaireKw: 25.6, productionActuelleKw: 0,
        bornes: [
          { identifiant: 'B1', type: 'DC_RAPIDE', statut: 'HORS_SERVICE' },
        ],
      },
      {
        id: '4', nom: 'Station Marrakech Gueliz', ville: 'Marrakech',
        statut: 'ACTIVE', puissanceSolaireKw: 41.5, productionActuelleKw: 33.1,
        bornes: [
          { identifiant: 'B1', type: 'AC', statut: 'DISPONIBLE' },
          { identifiant: 'B2', type: 'DC_RAPIDE', statut: 'DISPONIBLE' },
        ],
      },
    ];
  }

  getReservations(): Reservation[] {
    return [
      { id: 'r1', utilisateur: 'Yassine El Amrani', station: 'Casablanca Centre', borne: 'B1', dateDebut: '2026-08-05 09:00', dateFin: '2026-08-05 10:00', statut: 'CONFIRMEE', origine: 'RESERVEE' },
      { id: 'r2', utilisateur: 'Sara Bennis', station: 'Rabat Agdal', borne: 'B2', dateDebut: '2026-08-05 11:30', dateFin: '2026-08-05 12:30', statut: 'EN_ATTENTE', origine: 'RESERVEE' },
      { id: 'r3', utilisateur: 'Karim Idrissi', station: 'Marrakech Gueliz', borne: 'B1', dateDebut: '2026-08-04 15:00', dateFin: '2026-08-04 16:00', statut: 'TERMINEE', origine: 'WALK_IN' },
      { id: 'r4', utilisateur: 'Nadia Fassi', station: 'Casablanca Centre', borne: 'B2', dateDebut: '2026-08-04 08:00', dateFin: '2026-08-04 09:00', statut: 'ANNULEE', origine: 'RESERVEE' },
    ];
  }

  getStats() {
    const stations = this.getStations();
    const reservations = this.getReservations();
    return {
      totalStations: stations.length,
      stationsActives: stations.filter(s => s.statut === 'ACTIVE').length,
      productionTotaleKw: stations.reduce((sum, s) => sum + s.productionActuelleKw, 0),
      reservationsAujourdhui: reservations.filter(r => r.dateDebut.startsWith('2026-08-05')).length,
      bornesDisponibles: stations.flatMap(s => s.bornes).filter(b => b.statut === 'DISPONIBLE').length,
    };
  }
}