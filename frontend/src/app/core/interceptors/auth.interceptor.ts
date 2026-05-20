import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApi =
    environment.apiUrl === ''
      ? req.url.includes('/api/') || req.url.includes('/api?')
      : req.url.startsWith(environment.apiUrl);
  const skipAuth =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/refresh');

  let outgoing = req;
  const token = auth.getAccessToken();
  if (isApi && token && !skipAuth) {
    outgoing = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (
        err.status === 401 &&
        isApi &&
        !skipAuth &&
        !req.url.includes('/api/auth/logout')
      ) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const t = auth.getAccessToken();
            return next(
              req.clone({
                setHeaders: t ? { Authorization: `Bearer ${t}` } : {},
              }),
            );
          }),
          catchError(() => {
            auth.logout();
            router.navigateByUrl('/login');
            return throwError(() => err);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
