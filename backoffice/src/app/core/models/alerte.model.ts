export type TypeAlerte =
  | 'SEUIL_PRODUCTION_BAS'
  | 'BORNE_HORS_SERVICE'
  | 'MAINTENANCE_REQUISE'
  | 'ANOMALIE_CAPTEUR';

export type NiveauAlerte = 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE';
export type StatutAlerte = 'ACTIVE' | 'RESOLUE';

export interface AlerteDetail {
  id: string;
  stationNom: string;
  borneIdentifiant: string;
  type: TypeAlerte;
  niveau: NiveauAlerte;
  statut: StatutAlerte;
  message: string;
  dateCreation: string;
}