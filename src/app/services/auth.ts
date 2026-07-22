import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private rememberFlagKey = 'rememberMe';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mot-de-passe-oublie`, { email });
  }

  resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reinitialiser-mot-de-passe`, data);
  }

  private getStorage(): Storage {
    const remember = localStorage.getItem(this.rememberFlagKey) === 'true';
    return remember ? localStorage : sessionStorage;
  }

  saveToken(token: string, remember: boolean = true): void {
    localStorage.setItem(this.rememberFlagKey, remember ? 'true' : 'false');
    this.getStorage().setItem('token', token);
  }

  getToken(): string | null {
    return this.getStorage().getItem('token');
  }

  saveUser(user: CurrentUser): void {
    this.getStorage().setItem('user', JSON.stringify(user));
  }

  getUser(): CurrentUser | null {
    const raw = this.getStorage().getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(this.rememberFlagKey);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
}
