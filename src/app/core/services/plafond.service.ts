import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plafond } from '../models/plafond.model';

export interface PlafondResponse {
  status: string;
  message: string;
  data: Plafond[];
  status_code: number;
}

export interface PlafondCreateUpdate {
  amount: string | number;
  plan: string;
  annualRate: number;
  adminRate: number;
  colorStart: string;
  colorEnd: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlafondService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrl;

  getPlafonds(): Observable<PlafondResponse> {
    return this.http.get<PlafondResponse>(`${this.baseUrl}/plafonds`);
  }

  getPlafondById(id: string): Observable<{ status: string; message: string; data: Plafond; status_code: number }> {
    return this.http.get<{ status: string; message: string; data: Plafond; status_code: number }>(`${this.baseUrl}/plafonds/${id}`);
  }

  createPlafond(plafond: PlafondCreateUpdate): Observable<{ status: string; message: string; data: Plafond; status_code: number }> {
    return this.http.post<{ status: string; message: string; data: Plafond; status_code: number }>(`${this.baseUrl}/plafonds`, plafond);
  }

  updatePlafond(id: string, plafond: PlafondCreateUpdate): Observable<{ status: string; message: string; data: Plafond; status_code: number }> {
    return this.http.put<{ status: string; message: string; data: Plafond; status_code: number }>(`${this.baseUrl}/plafonds/${id}`, plafond);
  }

  deletePlafond(id: string): Observable<{ status: string; message: string; status_code: number }> {
    return this.http.delete<{ status: string; message: string; status_code: number }>(`${this.baseUrl}/plafonds/${id}`);
  }
}
