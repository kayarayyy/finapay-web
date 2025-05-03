// path: src/app/core/models/user.model.ts

export interface Role {
  id: string;
  name: string;
  authority: string;
}

export interface Auth {
  name: string;
  email: string;
  role: Role;
  token: string;
  features: string[];
  is_active: boolean;
}
