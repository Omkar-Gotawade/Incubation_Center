export type UserRole = "admin" | "prototyper" | "business";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Prototype {
  id: number;
  title: string;
  description: string;
  created_by: number;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}
