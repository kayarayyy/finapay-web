import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Branch } from "../models/branch.model";
import { response } from "express";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class BranchService {
    private baseUrl = environment.apiUrl;
    constructor(private http: HttpClient) {

    }

    getAllBranches(): Observable<Branch[]> {
        return this.http.get<{ data: Branch[] }>(`${this.baseUrl}/branches`)
            .pipe(map(response => response.data))
    }
}
