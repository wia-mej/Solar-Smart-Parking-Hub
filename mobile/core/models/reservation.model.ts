export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE';

export interface Reservation {
  id: string;  
  stationId: string;
  clientNom: string;
  stationNom: string;
  borneIdentifiant: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutReservation;
  origine: 'RESERVEE' | 'WALK_IN';
  
}