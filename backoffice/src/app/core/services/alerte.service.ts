import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AlerteDetail } from '../models/alerte.model';

@Injectable({
  providedIn: 'root',
})
export class AlerteService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/alertes';

  constructor(private http: HttpClient) {}

  getAlertesActives(): Observable<AlerteDetail[]> {
    return this.http.get<AlerteDetail[]>(`${this.baseUrl}/actives`);
  }
}