export type SourceProduction = 'MESUREE' | 'ESTIMEE';

export interface ProductionEnergieDetail {
  id: string;
  stationNom: string;
  timestamp: string;
  productionKw: number;
  irradiationWm2: number;
  source: SourceProduction;
}