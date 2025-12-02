import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = window.location.hostname.includes('localhost')
    ? 'http://127.0.0.1:8000/api'
    : 'https://gestornegocios-api.onrender.com/api';

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  // --- 1. LOGIN ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap((response: any) => {
        // Guardar Token
        localStorage.setItem('token', response.token);
        if (response.user_id) {
            localStorage.setItem('user_id', response.user_id);
        }

        this.isLoggedInSubject.next(true);
      })
    );
  }

  // --- 2. REGISTRO ---
  registro(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro/`, datos).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);

        // CORRECCIÓN AQUÍ TAMBIÉN
        if (response.user_id) {
            localStorage.setItem('user_id', response.user_id);
        }

        this.isLoggedInSubject.next(true);
      })
    );
  }

  // --- 3. LOGOUT ---
  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
      this.http.post(`${this.apiUrl}/auth/logout/`, {}, { headers }).subscribe();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    this.isLoggedInSubject.next(false);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }
}
