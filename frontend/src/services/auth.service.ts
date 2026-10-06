import api from "./api";

export interface LoginPayload   { email: string; password: string }
export interface RegisterPayload { email: string; password: string; firstName: string; lastName: string; role?: string }

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const login    = (payload: LoginPayload)    => api.post<{ data: AuthResponse }>("/api/auth/login",    payload);
export const register = (payload: RegisterPayload) => api.post<{ data: AuthResponse }>("/api/auth/register", payload);
export const logout   = ()                          => api.post("/api/auth/logout");
export const getMe    = ()                          => api.get<{ data: AuthUser }>("/api/auth/me");
