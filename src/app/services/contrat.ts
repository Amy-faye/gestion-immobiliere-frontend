import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class ContratService {
  private apiUrl = 'http://127.0.0.1:8000/api';

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

  getContrats(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/contrats?page=${page}&per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
  }

  getContrat(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/contrats/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createContrat(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contrats`, data, {
      headers: this.getHeaders(),
    });
  }

  updateContrat(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/contrats/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteContrat(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contrats/${id}`, {
      headers: this.getHeaders(),
    });
  }
  downloadContrat(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/contrats/${id}/pdf`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken()}`,
      }),
      responseType: 'blob' as 'json',
    }) as Observable<Blob>;
  }
}
