import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SessionChargeDetail } from '../models/session-charge.model';
import { API_BASE_URL } from '../config/api-config';


@Injectable({
  providedIn: 'root',
})
export class SessionChargeService {
  private readonly baseUrl = `${API_BASE_URL}/sessions-charge`;

  constructor(private http: HttpClient) {}

  getAllSessionsCharge(): Observable<SessionChargeDetail[]> {
    return this.http.get<SessionChargeDetail[]>(this.baseUrl);
  }
}