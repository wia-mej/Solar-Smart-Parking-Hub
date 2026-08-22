import { apiGet, apiGetOrNull, apiPost } from './api.client';
import type { SessionCharge } from '../models/session.model';

export function getMaSessionEnCours(): Promise<SessionCharge | null> {
  return apiGetOrNull<SessionCharge>('/sessions-charge/ma-session-en-cours');
}

export function getMesSessions(): Promise<SessionCharge[]> {
  return apiGet<SessionCharge[]>('/sessions-charge/mes-sessions');
}

export function demarrerSession(
  stationId: string,
  borneIdentifiant: string,
  origine: 'RESERVEE' | 'WALK_IN',
  reservationId?: string,
): Promise<SessionCharge> {
  return apiPost<SessionCharge>('/sessions-charge/demarrer', {
    stationId,
    borneIdentifiant,
    origine,
    reservationId: reservationId ?? null,
  });
}

export function arreterSession(id: string): Promise<SessionCharge> {
  // L'énergie est estimée par le serveur : on ne lui impose aucune valeur.
  return apiPost<SessionCharge>(`/sessions-charge/${id}/arreter`, { energieConsommeeKwh: 0 });
}