import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PredictionDetail } from '../models/prediction.model';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/predictions';

  constructor(private http: HttpClient) {}

  getAllPredictions(): Observable<PredictionDetail[]> {
    return this.http.get<PredictionDetail[]>(this.baseUrl);
  }

  getPredictionsProduction(): Observable<PredictionDetail[]> {
    return this.http.get<PredictionDetail[]>(`${this.baseUrl}/production`);
  }
}