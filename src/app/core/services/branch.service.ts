import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Branch } from '../models/branch.model';
import { response } from 'express';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllBranches(): Observable<Branch[]> {
    return this.http
      .get<{ data: Branch[] }>(`${this.baseUrl}/branches`)
      .pipe(map((response) => response.data));
  }

  createBranch(name: string, city: string, latitude: number, longitude: number): Observable<Branch> {
    const payload = {
      name: name,
      city: city,
      latitude: latitude,
      longitude: longitude,
    };
    return this.http.post<any>(`${this.baseUrl}/branches`, payload).pipe(map(response => response.data));
  }

  updateBranch(id: string, payload: any): Observable<Branch> {

    return this.http.put<any>(`${this.baseUrl}/branches/${id}`, payload).pipe(map(response => response.data));
  }

  deleteBranchById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/branches/${id}`);
  }

  assignManager(id: string, email: string): Observable<any> {
    const payload = {
      email: email,
    };
    return this.http.post<any>(
      `${this.baseUrl}/branches/${id}/assign-manager`,
      payload
    );
  }
  addMarketing(id: string, emails: string[]): Observable<any> {
    const payload = { emails };
    return this.http.post<any>(
      `${this.baseUrl}/branches/${id}/assign-marketing`,
      payload
    );
  }
}
