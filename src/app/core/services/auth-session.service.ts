// src/app/core/services/auth-session.service.ts

import { Injectable } from '@angular/core';
import { Auth } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  get auth(): Auth | null {
    const raw = localStorage.getItem('auth');
    return raw ? (JSON.parse(raw) as Auth) : null;
  }

  get name(): string {
    return this.auth?.name || 'Pengguna';
  }

  get role(): string {
    return this.auth?.role.name || 'Role Tidak Diketahui';
  }

  get token(): string | null {
    return this.auth?.token || null;
  }

  get features(): string[] {
    return this.auth?.features || [];
  }

  get isTokenExpired(): boolean {
    const token = this.token;
    if (!token) return true;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000); // dalam detik
      return expiry < now;
    } catch (e) {
      return true; // kalau parsing gagal, anggap expired
    }
  }

  clearSession() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    }
  }
  
}
