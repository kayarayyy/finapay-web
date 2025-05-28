import { Plafond } from "./plafond.model";
import { User } from "./user.model";

export interface CustomerDetails {
  id: string;

  // Menggunakan string karena di Java dikonversi ke Rupiah (format string)
  availablePlafond: string;
  usedPlafond: string;
  plafond: Plafond;

  user: User;

  street: string;
  district: string;
  province: string;
  postalCode: string;

  latitude: number;
  longitude: number;

  gender: string;
  ttl: string;
  formattedTtl: string;

  noTelp: string;
  nik: string;
  mothersName: string;
  job: string;
  salary: number;
  noRek: string;
  houseStatus: string;

  ktpUrl: string;
  selfieKtpUrl: string;
  houseUrl: string;
}
