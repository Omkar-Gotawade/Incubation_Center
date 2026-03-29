import { api } from "./client";
import { LoginPayload, RegisterPayload, TokenResponse, User } from "../types";

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>("/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/login", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/me");
  return data;
}
