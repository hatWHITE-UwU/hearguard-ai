import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated is false when no user', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated is true when currentUser is set', () => {
    service.currentUser.set({
      id: '1', name: 'Test', email: 't@t.com',
      age: 25, gender: 'male', occupation: '', city: '',
      settings: { reminders: false, darkTheme: true, volumeUnit: 'dba' },
    });
    expect(service.isAuthenticated()).toBe(true);
  });

  it('getAccessToken returns null when not logged in', () => {
    expect(service.getAccessToken()).toBeNull();
  });

  it('getAccessToken returns token stored in localStorage', () => {
    localStorage.setItem('hearguard_access', 'test-token-123');
    expect(service.getAccessToken()).toBe('test-token-123');
  });

  it('logout clears localStorage and resets user (non-demo)', () => {
    localStorage.setItem('hearguard_access', 'tok');
    localStorage.setItem('hearguard_refresh', 'ref');
    service.currentUser.set({
      id: '1', name: 'U', email: 'u@u.com',
      age: 20, gender: 'male', occupation: '', city: '',
      settings: { reminders: false, darkTheme: true, volumeUnit: 'dba' },
    });

    service.logout();

    expect(localStorage.getItem('hearguard_access')).toBeNull();
    expect(localStorage.getItem('hearguard_refresh')).toBeNull();
    if (!environment.publicDemo) {
      expect(service.currentUser()).toBeNull();
    }
  });

  it('loadUserFromStorage fetches /api/auth/me when token exists', () => {
    localStorage.setItem('hearguard_access', 'valid-token');
    service.loadUserFromStorage();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/me`);
    expect(req.request.method).toBe('GET');

    const fakeUser = {
      id: '1', name: 'Luis', email: 'l@l.com',
      age: 22, gender: 'male', occupation: 'Dev', city: 'Lima',
      settings: { reminders: true, darkTheme: true, volumeUnit: 'dba' },
    };
    req.flush({ success: true, data: { user: fakeUser }, message: 'ok' });

    expect(service.currentUser()?.name).toBe('Luis');
  });

  it('loadUserFromStorage sets null (no token, non-demo mode)', () => {
    if (environment.publicDemo) return;
    service.loadUserFromStorage();
    httpMock.expectNone(`${environment.apiUrl}/api/auth/me`);
    expect(service.currentUser()).toBeNull();
  });
});
