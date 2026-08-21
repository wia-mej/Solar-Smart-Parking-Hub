export type StatutSession = 'EN_COURS' | 'TERMINEE' | 'INTERROMPUE';

export interface SessionCharge {
  id: string;
  utilisateurNom: string;
  stationNom: string;
  borneIdentifiant: string;
  vehiculeImmatriculation: string | null;
  dateDebut: string;
  dateFin: string | null;
  energieConsommeeKwh: number;
  statut: StatutSession;
  origine: 'RESERVEE' | 'WALK_IN';
  puissanceKw: number;
}