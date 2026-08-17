export type RoleUtilisateur = 'CONDUCTEUR' | 'ADMIN';
export type TypeAbonnement = 'STANDARD' | 'PREMIUM';

export interface UtilisateurDetail {
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

export interface NewAdminRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface AdminCree {
  utilisateur: UtilisateurDetail;
  lienDefinitionMotDePasse: string;
}