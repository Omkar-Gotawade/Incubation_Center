import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getMe, login as loginRequest, register as registerRequest } from "../api/auth";
import { LoginPayload, RegisterPayload, User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("ims_user");
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ims_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem("ims_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem("ims_token");
        localStorage.removeItem("ims_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await loginRequest(payload);
    localStorage.setItem("ims_token", data.access_token);
    localStorage.setItem("ims_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload: RegisterPayload) => {
    await registerRequest(payload);
  };

  const logout = () => {
    localStorage.removeItem("ims_token");
    localStorage.removeItem("ims_user");
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
