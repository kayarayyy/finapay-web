import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Auth } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrl;

  async login(nip: string, password: string): Promise<boolean> {
    try {
      const payload = { nip, password };
      const response = await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/auth/login-employee`, payload)
      );

      const data = response.data;

      const user: Auth = {
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
        features: data.features.slice(1),
        is_active: data.is_active,
      };

      localStorage.setItem('auth', JSON.stringify(user));
      return true;
    } catch (error) {
      return false;
    }
  }

  register(nip: string, name: string, email: string, role_id: string, refferal: string, is_active: boolean): Observable<any> {
    const payload = {
      email: email,
      name: name,
      role_id: role_id,
      is_active: is_active,
      nip: nip,
      refferal: refferal,
    };

    return this.http.post<any>(`${this.baseUrl}/auth/register`, payload);
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const payload = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    };

    return this.http.put<{ message: string }>(`${this.baseUrl}/auth/change-password`, payload);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, { email });
  }

  setResetPassword(id: string, email: string, newPassword: string, confirmPassword: string): Observable<{ message: string }> {
    const payload = { email: email, new_password: newPassword, confirm_password: confirmPassword };
    console.log(payload)
    return this.http.put<{ message: string }>(`${this.baseUrl}/auth/reset-password/${id}`, payload);
  }

}
