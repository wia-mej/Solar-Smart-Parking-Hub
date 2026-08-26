import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProductionEnergieDetail } from '../models/production-energie.model';
import { API_BASE_URL } from '../config/api-config';


@Injectable({
  providedIn: 'root',
})
export class ProductionEnergieService {
  private readonly baseUrl = `${API_BASE_URL}/production-energie`;

  constructor(private http: HttpClient) {}

  getAllProductionEnergie(): Observable<ProductionEnergieDetail[]> {
    return this.http.get<ProductionEnergieDetail[]>(this.baseUrl);
  }
}