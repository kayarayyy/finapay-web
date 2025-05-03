import { HttpClient } from '@angular/common/http';
import { EmployeeDetails } from './../models/employee-details.model';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeDetailsService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getEmployeeProfileByEmail(): Observable<EmployeeDetails> {
    return this.http
      .get<{ data: EmployeeDetails }>(`${this.baseUrl}/employee-details`)
      .pipe(map((respone) => respone.data));
  }
}
