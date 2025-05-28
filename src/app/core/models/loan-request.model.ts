import { User } from "./user.model";

export interface LoanRequest {
  id: string;
  amount: number;
  interest: number | null;
  adminFee: number | null;
  refferal: string | null;
  tenor: number;
  purpose: string | null;

  latitude: number;
  longitude: number;

  branch: string | null;

  customer: User;
  marketing: User | null;
  marketingApprove: boolean | null;
  marketingNotes: string | null;
  marketingReviewedAt: string | null;

  branchManager: User | null;
  branchManagerApprove: boolean | null;
  branchManagerNotes: string | null;
  branchManagerApprovedAt: string | null;

  backOffice: User | null;
  backOfficeApproveDisburse: boolean | null;
  backOfficeNotes: string | null;
  backOfficeDisbursedAt: string | null;

  createdAt: string;
  completedAt: string | null;

  status: string | null;
}
