import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PlafondData {
  id?: string;
  amount: string;
  plan: string;
  annualRate: number;
  adminRate: number;
  colorStart: string;
  colorEnd: string;
}

export interface ApiResponse<T> {
  success: string;
  message: string;
  status_code: number;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PlafondService {
  private baseUrl = environment.apiUrl; // Sesuaikan dengan URL backend Anda
  private plafondSubject = new BehaviorSubject<PlafondData[]>([]);
  public plafonds$ = this.plafondSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.loadPlafonds();
  }

  // Get all plafonds
  getPlafonds(): Observable<ApiResponse<PlafondData[]>> {
    return this.http.get<ApiResponse<PlafondData[]>>(`${this.baseUrl}/plafonds`)
      .pipe(
        tap(response => {
          if (response.status_code == 200) {
            this.plafondSubject.next(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Get plafond by ID
  getPlafondById(id: string): Observable<ApiResponse<PlafondData>> {
    return this.http.get<ApiResponse<PlafondData>>(`${this.baseUrl}/plafonds/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new plafond
  createPlafond(plafond: PlafondData): Observable<ApiResponse<PlafondData>> {
    return this.http.post<ApiResponse<PlafondData>>(`${this.baseUrl}/plafonds`, plafond, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status_code == 201) {
            this.refreshPlafonds();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Update plafond
  updatePlafond(id: string, plafond: PlafondData): Observable<ApiResponse<PlafondData>> {
    return this.http.put<ApiResponse<PlafondData>>(`${this.baseUrl}/plafonds/${id}`, plafond, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status_code == 200) {
            this.refreshPlafonds();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Delete plafond
  deletePlafond(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/plafonds/${id}`)
      .pipe(
        tap(response => {
          if (response.status_code == 200) {
            this.refreshPlafonds();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Refresh plafonds data
  private refreshPlafonds(): void {
    this.getPlafonds().subscribe();
  }

  // Load initial data
  private loadPlafonds(): void {
    this.getPlafonds().subscribe();
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Parse currency string to number
  parseCurrency(currencyString: string): number {
    return parseInt(currencyString.replace(/[^\d]/g, ''));
  }

  // Validate plafond data
  validatePlafond(plafond: PlafondData): string[] {
    const errors: string[] = [];

    if (!plafond.amount || plafond.amount.trim() === '') {
      errors.push('Amount is required');
    }

    if (!plafond.plan || plafond.plan.trim() === '') {
      errors.push('Plan is required');
    }

    if (plafond.annualRate < 0 || plafond.annualRate > 1) {
      errors.push('Annual rate must be between 0 and 1');
    }

    if (plafond.adminRate < 0 || plafond.adminRate > 1) {
      errors.push('Admin rate must be between 0 and 1');
    }

    if (!plafond.colorStart || !this.isValidHexColor(plafond.colorStart)) {
      errors.push('Valid start color is required');
    }

    if (!plafond.colorEnd || !this.isValidHexColor(plafond.colorEnd)) {
      errors.push('Valid end color is required');
    }

    return errors;
  }

  // Validate hex color
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // Error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'Something went wrong';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}