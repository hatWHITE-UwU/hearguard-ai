import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
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
});
