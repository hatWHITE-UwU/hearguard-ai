import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Routes } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

const envSnapshot = { ...environment };

const testRoutes: Routes = [
  { path: 'login', component: class {} },
];

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    Object.assign(environment, { publicDemo: false, useDemoMocks: false });
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter(testRoutes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    Object.assign(environment, envSnapshot);
  });

  it('adds Authorization header for API requests when token exists', () => {
    localStorage.setItem('hearguard_access', 'my-jwt-token');

    http.get(`${environment.apiUrl}/api/noise`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/noise`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it('does NOT add Authorization header to login endpoint', () => {
    localStorage.setItem('hearguard_access', 'my-jwt-token');

    http.post(`${environment.apiUrl}/api/auth/login`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('does NOT add Authorization header to register endpoint', () => {
    localStorage.setItem('hearguard_access', 'tok');

    http.post(`${environment.apiUrl}/api/auth/register`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('does NOT add Authorization header when no token', () => {
    http.get(`${environment.apiUrl}/api/noise`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/noise`);
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('on 401 refreshes token and retries request', () => {
    localStorage.setItem('hearguard_access', 'expired');
    localStorage.setItem('hearguard_refresh', 'valid-refresh');

    http.get(`${environment.apiUrl}/api/noise`).subscribe();

    const first = httpMock.expectOne(`${environment.apiUrl}/api/noise`);
    first.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refresh = httpMock.expectOne(`${environment.apiUrl}/api/auth/refresh`);
    refresh.flush({
      success: true,
      data: { accessToken: 'new-token', refreshToken: 'new-ref' },
      message: 'ok',
    });

    const retry = httpMock.expectOne(`${environment.apiUrl}/api/noise`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
    retry.flush({});
  });

  it('on 401 con refresh fallido hace logout y navega a login', () => {
    localStorage.setItem('hearguard_access', 'expired');
    localStorage.setItem('hearguard_refresh', 'bad-ref');
    const auth = TestBed.inject(AuthService);
    const logoutSpy = vi.spyOn(auth, 'logout');

    http.get(`${environment.apiUrl}/api/noise`).subscribe({
      error: () => undefined,
    });

    httpMock.expectOne(`${environment.apiUrl}/api/noise`).flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });
    httpMock.expectOne(`${environment.apiUrl}/api/auth/refresh`).flush('fail', {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(logoutSpy).toHaveBeenCalled();
  });

  it('re-lanza error que no es 401 sin intentar refresh', () => {
    localStorage.setItem('hearguard_access', 'tok');
    let status = 0;
    http.get(`${environment.apiUrl}/api/noise`).subscribe({
      error: (err: { status: number }) => {
        status = err.status;
      },
    });
    httpMock.expectOne(`${environment.apiUrl}/api/noise`).flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    expect(status).toBe(500);
    httpMock.expectNone(`${environment.apiUrl}/api/auth/refresh`);
  });

  it('detects API request via URL when apiUrl is empty string', () => {
    const savedApiUrl = environment.apiUrl;
    Object.assign(environment, { apiUrl: '' });
    localStorage.setItem('hearguard_access', 'tok');

    http.get('/api/noise').subscribe();

    const req = httpMock.expectOne('/api/noise');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
    req.flush({});

    Object.assign(environment, { apiUrl: savedApiUrl });
  });
});
