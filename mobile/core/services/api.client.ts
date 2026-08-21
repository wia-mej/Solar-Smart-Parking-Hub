import { API_BASE_URL } from '../api-config';
import { getIdToken } from './auth.service';

export async function apiGet<T>(path: string): Promise<T> {
  const token = await getIdToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getIdToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/** Variante de apiGet pour les endpoints qui peuvent ne rien renvoyer (204). */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  const token = await getIdToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }
  return response.json() as Promise<T>;
}
