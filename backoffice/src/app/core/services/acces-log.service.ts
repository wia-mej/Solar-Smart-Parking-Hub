import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AccesLogDetail } from '../models/acces-log.model';

@Injectable({
  providedIn: 'root',
})
export class AccesLogService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/acces-logs';

  constructor(private http: HttpClient) {}

  getAllAccesLogs(): Observable<AccesLogDetail[]> {
    return this.http.get<AccesLogDetail[]>(this.baseUrl);
  }

  getAccesEchecs(): Observable<AccesLogDetail[]> {
    return this.http.get<AccesLogDetail[]>(`${this.baseUrl}/echecs`);
  }
}