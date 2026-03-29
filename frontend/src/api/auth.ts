import { api } from "./client";
import { LoginPayload, RegisterPayload, TokenResponse, User } from "../types";

interface ForgotPasswordPayload {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

interface ResetPasswordResponse {
  message: string;
}

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

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  const { data } = await api.post<ForgotPasswordResponse>("/forgot-password", payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  const { data } = await api.post<ResetPasswordResponse>("/reset-password", payload);
  return data;
}
