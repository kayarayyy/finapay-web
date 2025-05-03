export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nip: string | null;
  refferal: string | null;
  active: boolean;
  branch: string | null;
}
