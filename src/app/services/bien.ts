import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class BienService {
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

  // Headers sans Content-Type : le navigateur le fixe automatiquement
  // avec la bonne boundary multipart lors de l'envoi d'un FormData
  private getUploadHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
      Accept: 'application/json',
    });
  }

  getBiens(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/biens?page=${page}&per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
  }
  getAllBiens(): Observable<any> {
    return this.http.get(`${this.apiUrl}/biens?per_page=1000`, {
      headers: this.getHeaders(),
    });
  }

  getBien(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/biens/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createBien(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/biens`, formData, {
      headers: this.getUploadHeaders(),
    });
  }

  updateBien(id: number, formData: FormData): Observable<any> {
    // Laravel ne lit pas bien PUT + multipart : on simule via POST + _method
    formData.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/biens/${id}`, formData, {
      headers: this.getUploadHeaders(),
    });
  }

  deleteBien(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/biens/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
