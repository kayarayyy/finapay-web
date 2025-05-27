export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nip: string | null;
  refferal: string | null;
  branch: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  nip?: string;
  refferal?: string;
  branch?: string;
  active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  nip?: string;
  refferal?: string;
  branch?: string;
  active?: boolean;
  // email tidak bisa diupdate
}
