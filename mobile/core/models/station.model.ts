export type StatutBorne = 'DISPONIBLE' | 'OCCUPEE' | 'RESERVEE' | 'HORS_SERVICE';
export type TypeBorne = 'AC' | 'DC_RAPIDE';

export interface Borne {
  identifiant: string;
  type: TypeBorne;
  puissanceKw: number;
  statut: StatutBorne;
}

export interface Station {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  latitude: number;
  longitude: number;
  puissanceSolaireInstalleeKw: number;
  statut: string;
  bornes: Borne[];
}