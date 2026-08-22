export interface Creneau {
  heure: string;
  disponibilitePct: number;
}

export interface MeilleurCreneau {
  hubId: string;
  meilleur: Creneau | null;
  creneaux: Creneau[];
}