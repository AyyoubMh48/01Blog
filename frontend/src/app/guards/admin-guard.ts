import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (user && user.role === 'ROLE_ADMIN') {
    return true; // User is an admin, allow access
  }

  // User is not an admin, redirect to the home page
  router.navigate(['/feed']);
  return false;
};