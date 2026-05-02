import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  if (environment.publicDemo) {
    return true;
  }
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.getAccessToken()) {
    if (!auth.currentUser()) {
      auth.loadUserFromStorage();
    }
    return true;
  }
  return router.createUrlTree(['/login']);
};
