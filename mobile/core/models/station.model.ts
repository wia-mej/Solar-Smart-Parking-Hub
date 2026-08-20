export type StatutBorne = 'DISPONIBLE' | 'OCCUPEE' | 'RESERVEE' | 'HORS_SERVICE';

export interface Borne {
  identifiant: string;
  type: string;
  puissance: number;
  statut: StatutBorne;
}

export interface Station {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  statut: string;
  bornes: Borne[];
}