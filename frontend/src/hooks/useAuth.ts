import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import * as authService from "../services/auth.service";

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const { data } = await authService.login({ email, password });
    setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
    navigate(data.data.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const register = async (payload: authService.RegisterPayload) => {
    const { data } = await authService.register(payload);
    setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
    navigate("/dashboard");
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    navigate("/login");
  };

  return { user, isAuthenticated, login, register, logout };
};
