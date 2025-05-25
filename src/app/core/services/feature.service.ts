import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { RoleFeature } from "../models/role-feature.model";
import { environment } from "../../../environments/environment";
import { Role } from "../models/auth.model";
import { Feature } from "../models/feature.model";

// Interface untuk feature yang tersedia

@Injectable({ providedIn: 'root' })
export class FeatureService {
    private baseUrl = environment.apiUrl;
    
    constructor(private http: HttpClient) {}

    createFeature(name: string): Observable<Role> {
        const payload = {
            name: name
        };
        return this.http.post<any>(`${this.baseUrl}/features`, payload);
    }

    deleteFeatureById(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/features/${id}`);
    }

    getAllFeatures(): Observable<Feature[]> {
        return this.http.get<{ data: Feature[] }>(`${this.baseUrl}/features`)
            .pipe(map(response => response.data));
    }
}