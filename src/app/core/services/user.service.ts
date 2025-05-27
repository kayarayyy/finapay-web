import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`)
      .pipe(
        map(response => response.data || [])
      );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${id}`)
      .pipe(
        map(response => response.data!)
      );
  }

  updateUser(id: string, userData: Partial<User>): Observable<ApiResponse> {
    // Remove email from update data since it can't be changed
    const payload = {
      name: userData.name,
      role_id: userData.role,
      is_active: userData.active,
      nip: userData.nip,
      refferal: userData.refferal,
    };
    return this.http.put<ApiResponse>(`${this.baseUrl}/users/${id}`, payload);
  }

  deleteUserById(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${id}`);
  }

  // Additional utility methods
  toggleUserStatus(id: string, active: boolean): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/users/${id}/status`, { active });
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users/search?q=${query}`)
      .pipe(
        map(response => response.data || [])
      );
  }
}
