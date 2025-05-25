import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { RoleFeature } from "../models/role-feature.model";
import { environment } from "../../../environments/environment";
import { Role } from "../models/auth.model";

// Interface untuk feature yang tersedia
export interface Feature {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RoleFeatureService {
    private baseUrl = environment.apiUrl;
    
    constructor(private http: HttpClient) {}

    // Method yang sudah ada
    getAllRoleWithFeatures(): Observable<RoleFeature[]> {
        return this.http.get<{ data: RoleFeature[] }>(`${this.baseUrl}/role-features`)
            .pipe(map(response => response.data));
    }

    createRole(name: string): Observable<Role> {
        const payload = {
            name: name
        };
        return this.http.post<any>(`${this.baseUrl}/roles`, payload);
    }

    deleteRoleById(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/roles/${id}`);
    }

    deleteFeatureFromRole(role_id: string, feature_id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/role-features/${role_id}/${feature_id}`);
    }

    // Method baru yang diperlukan untuk fitur tambahan
    getAllFeatures(): Observable<Feature[]> {
        return this.http.get<{ data: Feature[] }>(`${this.baseUrl}/features`)
            .pipe(map(response => response.data));
    }

    addFeatureToRole(roleId: string, featureId: string): Observable<any> {
        const payload = {
            role_id: roleId,
            feature_id: featureId
        };
        return this.http.post(`${this.baseUrl}/role-features`, payload);
    }

    updateRole(roleId: string, newName: string): Observable<any> {
        const payload = {
            name: newName
        };
        return this.http.put(`${this.baseUrl}/roles/${roleId}`, payload);
    }

    // Method tambahan untuk menambah multiple features sekaligus (optional)
    addMultipleFeaturesToRole(roleId: string, featureIds: string[]): Observable<any> {
        const payload = {
            role_id: roleId,
            feature_ids: featureIds
        };
        return this.http.post(`${this.baseUrl}/role-features/bulk`, payload);
    }

    // Method tambahan untuk mendapatkan role by ID (jika diperlukan)
    getRoleById(roleId: string): Observable<Role> {
        return this.http.get<{ data: Role }>(`${this.baseUrl}/roles/${roleId}`)
            .pipe(map(response => response.data));
    }

    // Method untuk mendapatkan semua roles tanpa features (jika diperlukan)
    getAllRoles(): Observable<Role[]> {
        return this.http.get<{ data: Role[] }>(`${this.baseUrl}/roles`)
            .pipe(map(response => response.data));
    }
}