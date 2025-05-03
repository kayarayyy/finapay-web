import { User } from "./user.model";

export interface EmployeeDetails {
  id: string;
  street: string | null;
  district: string | null;
  province: string | null;
  postalCode: string | null;
  user: User | null;
}
