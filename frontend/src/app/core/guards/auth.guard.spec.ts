import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

class StubLoginComponent {}

function runGuard(): ReturnType<typeof authGuard> {
  return TestBed.runInInjectionContext(() =>
    authGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    ),
  );
}

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
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

  afterEach(() => localStorage.clear());

  it('returns true when access token is present', () => {
    localStorage.setItem('hearguard_access', 'valid-token');
    const result = runGuard();
    expect(result).toBe(true);
  });

  it('returns UrlTree to /login when no token (non-demo mode)', () => {
    if (environment.publicDemo) return;
    const result = runGuard();
    expect(result).not.toBe(true);
    expect(result).toBeTruthy();
    expect(router.serializeUrl(result as UrlTree)).toContain('login');
  });

  it('returns true without token in publicDemo mode', () => {
    if (!environment.publicDemo) return;
    const result = runGuard();
    expect(result).toBe(true);
  });

  it('calls loadUserFromStorage when token exists but user not loaded (non-demo)', () => {
    if (environment.publicDemo) return;
    localStorage.setItem('hearguard_access', 'tok');
    const spy = vi.spyOn(authService, 'loadUserFromStorage');
    runGuard();
    expect(spy).toHaveBeenCalled();
  });
});
