export type TypeEvenementAcces = 'DEMARRAGE_SESSION' | 'ARRET_SESSION' | 'TENTATIVE_ACCES';
export type ResultatAcces = 'SUCCES' | 'ECHEC';

export interface AccesLogDetail {
  id: string;
  utilisateurNom: string;
  stationNom: string;
  borneIdentifiant: string;
  typeEvenement: TypeEvenementAcces;
  resultat: ResultatAcces;
  message: string;
  timestamp: string;
}