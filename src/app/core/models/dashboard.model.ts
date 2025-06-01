import { Branch } from "./branch.model";

export interface Dashboard {
  totalBranches: number;
  totalActiveUsers: number;
  totalLoanRequests: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  amountApproved: number; // atau string, tergantung backend kirim dalam format apa
  amountRejected: number;
  amountPending: number;
  branches: Branch[];
}