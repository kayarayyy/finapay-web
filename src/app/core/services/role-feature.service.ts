import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { RoleFeature } from "../models/role-feature.model";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class RoleFeatureService {
    private baseUrl = environment.apiUrl;
    constructor(private http: HttpClient) {

    }

    getAllRoleWithFeatures(): Observable<RoleFeature[]>{
            return this.http.get<{ data:RoleFeature[] }>(`${this.baseUrl}/role-features`)
            .pipe(map(response => response.data));
        }
}
