import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const envSnapshot = { ...environment };

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    Object.assign(environment, { publicDemo: false, useDemoMocks: false });
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
    Object.assign(environment, envSnapshot);
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
    expect(service.currentUser()).toBeNull();
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
    service.loadUserFromStorage();
    httpMock.expectNone(`${environment.apiUrl}/api/auth/me`);
    expect(service.currentUser()).toBeNull();
  });

  it('loadUserFromStorage sets DEMO_USER (no token, publicDemo mode)', () => {
    Object.assign(environment, { publicDemo: true });
    service.loadUserFromStorage();
    httpMock.expectNone(`${environment.apiUrl}/api/auth/me`);
    expect(service.currentUser()).not.toBeNull();
  });

  it('logout sets DEMO_USER instead of null in publicDemo mode', () => {
    Object.assign(environment, { publicDemo: true });
    service.logout();
    expect(service.currentUser()).not.toBeNull();
  });

  it('loadUserFromStorage llama logout si /me falla', () => {
    localStorage.setItem('hearguard_access', 'bad-token');
    const logoutSpy = vi.spyOn(service, 'logout');
    service.loadUserFromStorage();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/me`);
    req.flush('error', { status: 401, statusText: 'Unauthorized' });
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('login persiste tokens y usuario', () => {
    const payload = {
      user: {
        id: '1', name: 'L', email: 'l@l.com',
        age: 20, gender: 'male', occupation: '', city: '',
        settings: { reminders: false, darkTheme: true, volumeUnit: 'dba' },
      },
      accessToken: 'acc',
      refreshToken: 'ref',
    };
    service.login({ email: 'l@l.com', password: 'Pass1234' }).subscribe((d) => {
      expect(d.accessToken).toBe('acc');
      expect(service.currentUser()?.email).toBe('l@l.com');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    req.flush({ success: true, data: payload, message: 'ok' });
    expect(localStorage.getItem('hearguard_access')).toBe('acc');
  });

  it('register persiste sesión', () => {
    service
      .register({ name: 'N', email: 'n@n.com', password: 'Pass1234' })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
    req.flush({
      success: true,
      data: {
        user: {
          id: '2', name: 'N', email: 'n@n.com',
          age: 22, gender: 'female', occupation: 'x', city: 'y',
          settings: { reminders: true, darkTheme: false, volumeUnit: 'dba' },
        },
        accessToken: 'a2',
        refreshToken: 'r2',
      },
      message: 'ok',
    });
    expect(localStorage.getItem('hearguard_refresh')).toBe('r2');
  });

  it('refreshToken actualiza tokens en localStorage', () => {
    localStorage.setItem('hearguard_refresh', 'old-ref');
    service.refreshToken().subscribe((token) => {
      expect(token).toBe('new-acc');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/refresh`);
    expect(req.request.body).toEqual({ refreshToken: 'old-ref' });
    req.flush({
      success: true,
      data: { accessToken: 'new-acc', refreshToken: 'new-ref' },
      message: 'ok',
    });
    expect(localStorage.getItem('hearguard_access')).toBe('new-acc');
  });

  it('refreshToken sin refresh en storage lanza error', () => {
    let err: Error | undefined;
    service.refreshToken().subscribe({
      error: (e) => {
        err = e as Error;
      },
    });
    expect(err?.message).toBe('no refresh');
  });

  it('patchMe() llama PATCH /api/auth/me con el body dado', () => {
    const body = { age: 28, city: 'Lima' };
    service.patchMe(body).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/me`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush({
      success: true,
      data: {
        user: {
          id: '1', name: 'Luis', email: 'l@l.com',
          age: 28, gender: 'male', occupation: '', city: 'Lima',
          settings: { reminders: true, darkTheme: true, volumeUnit: 'dba' },
        },
      },
    });
  });

  it('patchMe() actualiza currentUser con la respuesta del servidor', () => {
    const updatedUser = {
      id: '1', name: 'Luis', email: 'l@l.com',
      age: 30, gender: 'male', occupation: 'Dev', city: 'Huancayo',
      settings: { reminders: false, darkTheme: true, volumeUnit: 'dba' },
    };
    service.patchMe({ age: 30, city: 'Huancayo' }).subscribe((u) => {
      expect(u.city).toBe('Huancayo');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/me`);
    req.flush({ success: true, data: { user: updatedUser } });
    expect(service.currentUser()?.city).toBe('Huancayo');
    expect(service.currentUser()?.age).toBe(30);
  });

  it('patchMe() devuelve el User del servidor como Observable', () => {
    let result: { name: string } | undefined;
    service.patchMe({ name: 'Hardy' }).subscribe((u) => {
      result = u;
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/me`);
    req.flush({
      success: true,
      data: {
        user: {
          id: '2', name: 'Hardy', email: 'h@h.com',
          age: 25, gender: 'male', occupation: '', city: '',
          settings: { reminders: true, darkTheme: true, volumeUnit: 'dba' },
        },
      },
    });
    expect(result?.name).toBe('Hardy');
  });
});
