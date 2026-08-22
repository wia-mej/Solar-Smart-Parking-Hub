export type RoleUtilisateur = 'ADMIN' | 'CONDUCTEUR';
export type TypeAbonnement = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CORPORATE';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: RoleUtilisateur;
  dateCreation: string;
  abonnementType: TypeAbonnement | null;
  abonnementActif: boolean;
  nombreVehicules: number;
}