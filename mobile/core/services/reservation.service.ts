import { apiGet, apiPost } from './api.client';
import { toLocalIso } from '../date';
import type { Reservation } from '../models/reservation.model';

export function getMesReservations(): Promise<Reservation[]> {
  return apiGet<Reservation[]>('/reservations/mes-reservations');
}

export function creerReservation(
  stationId: string,
  borneIdentifiant: string,
  debut: Date,
  fin: Date,
): Promise<Reservation> {
  return apiPost<Reservation>('/reservations', {
    stationId,
    borneIdentifiant,
    dateDebut: toLocalIso(debut),
    dateFin: toLocalIso(fin),
  });
}

export function annulerReservation(id: string): Promise<Reservation> {
  return apiPost<Reservation>(`/reservations/${id}/annuler`, {});
}