import { apiGet, apiPost } from './api.client';
import type { TypeAbonnement, Utilisateur } from '../models/utilisateur.model';

export function inscrireConducteur(nom: string, prenom: string, telephone: string) {
  return apiPost<unknown>('/utilisateurs/inscription', { nom, prenom, telephone });
}

export function getMonProfil(): Promise<Utilisateur> {
  return apiGet<Utilisateur>('/utilisateurs/moi');
}

export function souscrireAbonnement(type: TypeAbonnement): Promise<Utilisateur> {
  return apiPost<Utilisateur>('/utilisateurs/moi/abonnement', { type });
}

export function resilierAbonnement(): Promise<Utilisateur> {
  return apiPost<Utilisateur>('/utilisateurs/moi/abonnement/resilier', {});
}