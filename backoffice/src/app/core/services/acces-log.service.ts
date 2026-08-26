import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AccesLogDetail } from '../models/acces-log.model';
import { API_BASE_URL } from '../config/api-config';


@Injectable({
  providedIn: 'root',
})
export class AccesLogService {
  private readonly baseUrl = `${API_BASE_URL}/acces-logs`;

  constructor(private http: HttpClient) {}

  getAllAccesLogs(): Observable<AccesLogDetail[]> {
    return this.http.get<AccesLogDetail[]>(this.baseUrl);
  }

  getAccesEchecs(): Observable<AccesLogDetail[]> {
    return this.http.get<AccesLogDetail[]>(`${this.baseUrl}/echecs`);
  }
}