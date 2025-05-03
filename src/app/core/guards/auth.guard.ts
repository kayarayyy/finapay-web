import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(AuthSessionService);

  if (typeof window !== 'undefined' && session.token && !session.isTokenExpired) {
    return true;
  }

  session.clearSession(); // kalau expired, clear session
  router.navigate(['/login']);
  return false;
};