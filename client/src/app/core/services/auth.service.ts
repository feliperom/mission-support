import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  missionary: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = this.decodeJwt(token);
        if (payload.exp * 1000 > Date.now()) {
          this._currentUser.set({
            id: payload.sub || payload.missionaryId,
            name: payload.name || payload.email,
            email: payload.email,
            role: payload.role || 'user',
          });
        } else {
          this.clearTokens();
        }
      } catch {
        this.clearTokens();
      }
    }
  }

  private decodeJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => {
        this.storeTokens(res.accessToken, res.refreshToken);
        this._currentUser.set(res.missionary);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this._error.set(err.error?.message || 'Login failed');
        throw err;
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>('/api/auth/register', { name, email, password }).pipe(
      tap((res) => {
        this.storeTokens(res.accessToken, res.refreshToken);
        this._currentUser.set(res.missionary);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this._error.set(err.error?.message || 'Registration failed');
        throw err;
      })
    );
  }

  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken }).pipe(
      tap((res) => {
        this.storeTokens(res.accessToken, res.refreshToken);
        this._currentUser.set(res.missionary);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.clearTokens();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /** For demo/development: set a mock user without API */
  setMockUser(): void {
    this._currentUser.set({
      id: '1',
      name: 'Felipe Romero',
      email: 'felipe@mission.org',
      role: 'missionary',
    });
  }
}
