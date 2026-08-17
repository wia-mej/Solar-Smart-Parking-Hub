import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UtilisateurDetail } from '../models/utilisateur.model';
import { NewAdminRequest, AdminCree } from '../models/utilisateur.model';
@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/utilisateurs';

  constructor(private http: HttpClient) {}

  getAllUtilisateurs(): Observable<UtilisateurDetail[]> {
    return this.http.get<UtilisateurDetail[]>(this.baseUrl);
  }

  getUtilisateursPremium(): Observable<UtilisateurDetail[]> {
    return this.http.get<UtilisateurDetail[]>(`${this.baseUrl}/premium`);
  }

  creerAdministrateur(admin: NewAdminRequest): Observable<AdminCree> {
    return this.http.post<AdminCree>(`${this.baseUrl}/admin`, admin);
  }
}