export type RoleUtilisateur = 'ADMIN' | 'CONDUCTEUR';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: RoleUtilisateur;
  dateCreation: string;
  abonnementType: string | null;
  abonnementActif: boolean;
  nombreVehicules: number;
}