// src/app/core/guards/feature.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export function featureGuard(...requiredFeatures: string[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);

    const userFeatures = authSession.features || [];

    const hasFeature = requiredFeatures.some(feature => userFeatures.includes(feature));

    if (hasFeature) {
      return true;
    }

    return router.parseUrl('/login');
  };
}

