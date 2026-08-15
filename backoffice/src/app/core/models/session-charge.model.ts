export type StatutSession = 'EN_COURS' | 'TERMINEE' | 'INTERROMPUE';
export type OrigineSession = 'RESERVEE' | 'WALK_IN';

export interface SessionChargeDetail {
  id: string;
  utilisateurNom: string;
  stationNom: string;
  borneIdentifiant: string;
  vehiculeImmatriculation: string;
  dateDebut: string;
  dateFin: string | null;
  energieConsommeeKwh: number;
  statut: StatutSession;
  origine: OrigineSession;
}