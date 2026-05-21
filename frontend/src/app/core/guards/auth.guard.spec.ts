import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

class StubLoginComponent { static readonly selector = 'app-stub-login'; }

function runGuard(): ReturnType<typeof authGuard> {
  return TestBed.runInInjectionContext(() =>
    authGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    ),
  );
}

const envSnapshot = { ...environment };

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    Object.assign(environment, { publicDemo: false, useDemoMocks: false });
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([{ path: 'login', component: StubLoginComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
    Object.assign(environment, envSnapshot);
  });

  it('returns true immediately in publicDemo mode', () => {
    Object.assign(environment, { publicDemo: true });
    expect(runGuard()).toBe(true);
  });

  it('returns true when access token is present', () => {
    localStorage.setItem('hearguard_access', 'valid-token');
    const result = runGuard();
    expect(result).toBe(true);
  });

  it('returns UrlTree to /login when no token (non-demo mode)', () => {
    const result = runGuard();
    expect(result).not.toBe(true);
    expect(result).toBeTruthy();
    expect(router.serializeUrl(result as UrlTree)).toContain('login');
  });

  it('calls loadUserFromStorage when token exists but user not loaded (non-demo)', () => {
    localStorage.setItem('hearguard_access', 'tok');
    const spy = vi.spyOn(authService, 'loadUserFromStorage');
    runGuard();
    expect(spy).toHaveBeenCalled();
  });

  it('skips loadUserFromStorage when currentUser is already set', () => {
    localStorage.setItem('hearguard_access', 'tok');
    authService.currentUser.set({
      id: '1', name: 'U', email: 'u@u.com',
      age: 25, gender: 'male', occupation: '', city: '',
      settings: { reminders: false, darkTheme: true, volumeUnit: 'dba' },
    });
    const spy = vi.spyOn(authService, 'loadUserFromStorage');
    const result = runGuard();
    expect(spy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
