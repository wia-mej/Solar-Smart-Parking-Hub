import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PredictionDetail } from '../models/prediction.model';
import { API_BASE_URL } from '../config/api-config';


@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  private readonly baseUrl = `${API_BASE_URL}/predictions`;

  constructor(private http: HttpClient) {}

  getAllPredictions(): Observable<PredictionDetail[]> {
    return this.http.get<PredictionDetail[]>(this.baseUrl);
  }

  getPredictionsProduction(): Observable<PredictionDetail[]> {
    return this.http.get<PredictionDetail[]>(`${this.baseUrl}/production`);
  }
}