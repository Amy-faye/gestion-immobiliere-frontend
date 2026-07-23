import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
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

  getMaintenances(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenances?page=${page}&per_page=${perPage}`, {
      headers: this.getHeaders(),
    });
  }

  createMaintenance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/maintenances`, data, {
      headers: this.getHeaders(),
    });
  }

  updateMaintenance(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/maintenances/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteMaintenance(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/maintenances/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
