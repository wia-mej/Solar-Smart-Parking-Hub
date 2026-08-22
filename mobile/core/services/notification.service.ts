/**
 * Notifications — désactivées pour l'instant.
 *
 * expo-notifications ne peut pas être chargé dans Expo Go depuis le SDK 53
 * (le module est retiré de l'application Expo Go sur Android). Les fonctions
 * ci-dessous conservent la même signature que la version réelle : le jour où
 * l'application tournera dans une version compilée (development build), il
 * suffira de réactiver l'implémentation sans toucher aux écrans.
 */

export const CAPACITE_BATTERIE_KWH = 0.5;

export async function demanderPermissionNotifications(): Promise<boolean> {
  return false;
}

export async function programmerAlertesCharge(
  _stationNom: string,
  _borneIdentifiant: string,
  _puissanceKw: number,
): Promise<void> {
  // à réactiver dans une version compilée de l'app
}

export async function programmerRappelFinReservation(
  _stationNom: string,
  _dateFin: string,
): Promise<void> {
  // à réactiver dans une version compilée de l'app
}

export async function annulerAlertes(): Promise<void> {
  // à réactiver dans une version compilée de l'app
}