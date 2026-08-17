import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReservationDetail } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/reservations';

  constructor(private http: HttpClient) {}

  getAllReservations(): Observable<ReservationDetail[]> {
    return this.http.get<ReservationDetail[]>(this.baseUrl);
  }
}