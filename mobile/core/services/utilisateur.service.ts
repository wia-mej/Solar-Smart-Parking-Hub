import { apiPost } from './api.client';

export function inscrireConducteur(nom: string, prenom: string, telephone: string) {
  return apiPost<unknown>('/utilisateurs/inscription', { nom, prenom, telephone });
}