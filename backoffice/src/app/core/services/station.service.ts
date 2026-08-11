import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Station } from '../models/station.model';

@Injectable({
  providedIn: 'root',
})
export class StationService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/stations';

  constructor(private http: HttpClient) {}

  getAllStations(): Observable<Station[]> {
    return this.http.get<Station[]>(this.baseUrl);
  }

  getStationById(id: string): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/${id}`);
  }
}