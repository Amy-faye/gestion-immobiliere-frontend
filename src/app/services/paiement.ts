import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class PaiementService {
  private apiUrl = 'https://gestion-immobiliere-backend.onrender.com';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  getPaiements(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/paiements?page=${page}&per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
  }

  createPaiement(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/paiements`, data, {
      headers: this.getHeaders(),
    });
  }

  updatePaiement(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/paiements/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deletePaiement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/paiements/${id}`, {
      headers: this.getHeaders(),
    });
  }
  downloadQuittance(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/paiements/${id}/quittance`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken()}`,
      }),
      responseType: 'blob' as 'json',
    }) as Observable<Blob>;
  }
}
