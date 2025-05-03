import { CustomerDetails } from "./customer-details";
import { LoanRequest } from "./loan-request.model";

export interface ReviewLoan {
  loanRequest: LoanRequest;
  customerDetails: CustomerDetails;
}
