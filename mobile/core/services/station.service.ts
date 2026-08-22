import { apiGet } from './api.client';
import type { Station } from '../models/station.model';

export function getAllStations(): Promise<Station[]> {
  return apiGet<Station[]>('/stations');
}