// redirect.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const redirectIfLoggedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(AuthSessionService);

  // Cek apakah dijalankan di browser
  if (typeof window !== 'undefined') {
    const token = session.token
    if (token) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
