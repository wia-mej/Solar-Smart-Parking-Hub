export type TypePrediction = 'PRODUCTION' | 'DISPONIBILITE';

export interface PredictionDetail {
  id: string;
  stationNom: string;
  typePrediction: TypePrediction;
  timestampCible: string;
  valeurPredite: number;
  dateGeneration: string;
}