import { User } from "./user.model";

export interface CustomerDetails {
  id: string;
  availablePlafond: number;
  plafondId: string;
  street: string;
  district: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  user: User;
  ktp: string;
  houseOwnership: string;
}
