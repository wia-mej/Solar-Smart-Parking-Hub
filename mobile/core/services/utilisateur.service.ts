import { apiGet, apiPost } from './api.client';
import type { Utilisateur } from '../models/utilisateur.model';

export function inscrireConducteur(nom: string, prenom: string, telephone: string) {
  return apiPost<unknown>('/utilisateurs/inscription', { nom, prenom, telephone });
}

export function getMonProfil(): Promise<Utilisateur> {
  return apiGet<Utilisateur>('/utilisateurs/moi');
}