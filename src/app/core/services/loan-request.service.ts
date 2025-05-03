import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LoanRequest } from '../models/loan-request.model';
import { response } from 'express';
import { environment } from '../../../environments/environment';
import { ReviewLoan } from '../models/review-loan';

@Injectable({ providedIn: 'root' })
export class LoanRequestService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllLoanRequest(): Observable<LoanRequest[]> {
    return this.http
      .get<{ data: LoanRequest[] }>(`${this.baseUrl}/loan-requests`)
      .pipe(map((response) => response.data));
  }
  getAllLoanRequestReview(): Observable<LoanRequest[]> {
    return this.http
      .get<{ data: LoanRequest[] }>(`${this.baseUrl}/loan-requests/reviews`)
      .pipe(map((response) => response.data));
  }
  getLoanRequestByIdReview(id: string): Observable<ReviewLoan> {
    return this.http
      .get<{ data: ReviewLoan }>(
        `${this.baseUrl}/loan-requests/reviews/${id}`
      )
      .pipe(map((response) => response.data));
  }
  updateLoanRequestReview(id: string, review: boolean, notes: string): Observable<any> {
    const payload = {
      review: review,
      notes: notes
    }

    console.log(payload);

    return this.http.put<{ message: string }>(`${this.baseUrl}/loan-requests/reviews/${id}`, payload);
  }

  getAllLoanRequestApproval(): Observable<LoanRequest[]> {
    return this.http
      .get<{ data: LoanRequest[] }>(`${this.baseUrl}/loan-requests/approvals`)
      .pipe(map((response) => response.data));
  }
  getLoanRequestByIdApproval(id: string): Observable<ReviewLoan> {
    return this.http
      .get<{ data: ReviewLoan }>(
        `${this.baseUrl}/loan-requests/approvals/${id}`
      )
      .pipe(map((response) => response.data));
  }
  updateLoanRequestApproval(id: string, approval: boolean, notes: string): Observable<any> {
    const payload = {
      approval: approval,
      notes: notes
    }

    console.log(payload);

    return this.http.put<{ message: string }>(`${this.baseUrl}/loan-requests/approvals/${id}`, payload);
  }

  getLoanRequestCount(): Observable<number> {
    return this.http
      .get<{ data: number }>(`${this.baseUrl}/loan-requests/disbursement-count`)
      .pipe(map((response) => response.data));
  }
  getLoanRequestFirstDisbursement(): Observable<LoanRequest> {
    return this.http
      .get<{ data: LoanRequest }>(`${this.baseUrl}/loan-requests/disbursement`)
      .pipe(map((response) => response.data));
  }
  getLoanRequestByIdDisbursement(id: string): Observable<ReviewLoan> {
    return this.http
      .get<{ data: ReviewLoan }>(
        `${this.baseUrl}/loan-requests/disbursement/${id}`
      )
      .pipe(map((response) => response.data));
  }
  getAllLoanRequestDisbursementOngoing(): Observable<LoanRequest[]> {
    return this.http
      .get<{ data: LoanRequest[] }>(`${this.baseUrl}/loan-requests/disbursement-ongoing`)
      .pipe(map((response) => response.data));
  }

}
