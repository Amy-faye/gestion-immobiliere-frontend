import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class ReclamationService {
  private apiUrl = 'https://gestion-immobiliere-backend.onrender.com/api';
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

  getReclamations(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/reclamations?page=${page}&per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
  }

  createReclamation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reclamations`, data, {
      headers: this.getHeaders(),
    });
  }

  updateReclamation(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reclamations/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteReclamation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reclamations/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
