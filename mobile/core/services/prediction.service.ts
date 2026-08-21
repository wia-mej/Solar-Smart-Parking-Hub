import { apiGet } from './api.client';
import type { MeilleurCreneau } from '../models/prediction.model';

export function getMeilleurCreneau(ville: string): Promise<MeilleurCreneau> {
  return apiGet<MeilleurCreneau>(`/predictions/meilleur-creneau?ville=${encodeURIComponent(ville)}`);
}