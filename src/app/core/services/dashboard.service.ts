import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Dashboard } from "../models/dashboard.model";

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getDashboardSuperadmin(): Observable<Dashboard> {
        return this.http
            .get<{ data: Dashboard }>(`${this.baseUrl}/dashboard/superadmin`)
            .pipe(map((response) => response.data));
    }

    getDashboardMarketing(): Observable<Dashboard> {
        return this.http
            .get<{ data: Dashboard }>(`${this.baseUrl}/dashboard/marketing`)
            .pipe(map((response) => response.data));
    }
    getDashboardBranchManager(): Observable<Dashboard> {
        return this.http
            .get<{ data: Dashboard }>(`${this.baseUrl}/dashboard/branch-manager`)
            .pipe(map((response) => response.data));
    }
    getDashboardBackOffice(): Observable<Dashboard> {
        return this.http
            .get<{ data: Dashboard }>(`${this.baseUrl}/dashboard/back-office`)
            .pipe(map((response) => response.data));
    }
}