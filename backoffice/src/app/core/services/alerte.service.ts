import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AlerteDetail } from '../models/alerte.model';
import { API_BASE_URL } from '../config/api-config';


@Injectable({
  providedIn: 'root',
})
export class AlerteService {
  private readonly baseUrl = `${API_BASE_URL}/alertes`;

  constructor(private http: HttpClient) {}

  getAlertesActives(): Observable<AlerteDetail[]> {
    return this.http.get<AlerteDetail[]>(`${this.baseUrl}/actives`);
  }
}