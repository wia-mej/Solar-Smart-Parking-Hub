export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE';
export type OrigineReservation = 'RESERVEE' | 'WALK_IN';

export interface ReservationDetail {
  id: string;
  clientNom: string;
  stationNom: string;
  borneIdentifiant: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutReservation;
  origine: OrigineReservation;
}