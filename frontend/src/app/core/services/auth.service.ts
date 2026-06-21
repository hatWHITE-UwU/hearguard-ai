import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ApiEnvelope,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../../shared/models/auth.model';
import type { User } from '../../shared/models/user.model';
import { DEMO_USER } from '../data/demo-mocks';

const ACCESS = 'hearguard_access';
const REFRESH = 'hearguard_refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly httpRaw = new HttpClient(inject(HttpBackend));
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  loadUserFromStorage(): void {
    const token = localStorage.getItem(ACCESS);
    if (!token) {
      this.currentUser.set(
        environment.publicDemo ? { ...DEMO_USER } : null,
      );
      return;
    }
    this.http
      .get<ApiEnvelope<{ user: User }>>(`${environment.apiUrl}/api/auth/me`)
      .subscribe({
        next: (r) => this.currentUser.set(r.data.user),
        error: () => this.logout(),
      });
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiEnvelope<AuthResponse>>(`${environment.apiUrl}/api/auth/login`, req)
      .pipe(
        map((r) => r.data),
        tap((d) => this.persistSession(d)),
        tap((d) => this.currentUser.set(d.user)),
      );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiEnvelope<AuthResponse>>(`${environment.apiUrl}/api/auth/register`, req)
      .pipe(
        map((r) => r.data),
        tap((d) => this.persistSession(d)),
        tap((d) => this.currentUser.set(d.user)),
      );
  }

  logout(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    this.currentUser.set(
      environment.publicDemo ? { ...DEMO_USER } : null,
    );
    this.router.navigateByUrl('/');
  }

  refreshToken(): Observable<string> {
    const refresh = localStorage.getItem(REFRESH);
    if (!refresh) {
      return throwError(() => new Error('no refresh'));
    }
    return this.httpRaw
      .post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
        `${environment.apiUrl}/api/auth/refresh`,
        { refreshToken: refresh },
      )
      .pipe(
        tap((r) => {
          localStorage.setItem(ACCESS, r.data.accessToken);
          localStorage.setItem(REFRESH, r.data.refreshToken);
        }),
        map((r) => r.data.accessToken),
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS);
  }

  private persistSession(data: AuthResponse): void {
    localStorage.setItem(ACCESS, data.accessToken);
    localStorage.setItem(REFRESH, data.refreshToken);
  }
}
