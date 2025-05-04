import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { RoleFeature } from "../models/role-feature.model";
import { environment } from "../../../environments/environment";
import { Role } from "../models/auth.model";

@Injectable({ providedIn: 'root' })
export class RoleFeatureService {
    private baseUrl = environment.apiUrl;
    constructor(private http: HttpClient) {

    }

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
}
