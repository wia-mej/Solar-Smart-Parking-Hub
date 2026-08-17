import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProductionEnergieDetail } from '../models/production-energie.model';

@Injectable({
  providedIn: 'root',
})
export class ProductionEnergieService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/production-energie';

  constructor(private http: HttpClient) {}

  getAllProductionEnergie(): Observable<ProductionEnergieDetail[]> {
    return this.http.get<ProductionEnergieDetail[]>(this.baseUrl);
  }
}