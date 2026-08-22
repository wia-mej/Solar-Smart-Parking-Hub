import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  /**
   * Fonction présente uniquement dans le build React Native de Firebase Auth.
   * Ses types ne sont pas exposés par l'entrée par défaut du paquet, on les
   * déclare donc ici pour que TypeScript la reconnaisse.
   */
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}