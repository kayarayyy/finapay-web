import { User } from "./user.model";

export interface LoanRequest {
    id: string;
    amount: string;
    tenor: number;
    interest: number | null;
    refferal: string | null;
    customer: User;
    marketing: User | null;
    marketingApprove: boolean | null;
    marketingNotes: string | null;
    branchManager: User | null;
    branchManagerApprove: boolean | null;
    branchManagerNotes: string | null;
    backOffice: User | null;
    backOfficeApprove: boolean | null;
    backOfficeNotes: string | null;
    latitude: number;
    longitude: number;
    branch: string | null;
}
