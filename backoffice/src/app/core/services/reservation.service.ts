import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReservationDetail } from '../models/reservation.model';
import { API_BASE_URL } from '../config/api-config';


@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly baseUrl = `${API_BASE_URL}/reservations`;

  constructor(private http: HttpClient) {}

  getAllReservations(): Observable<ReservationDetail[]> {
    return this.http.get<ReservationDetail[]>(this.baseUrl);
  }
}