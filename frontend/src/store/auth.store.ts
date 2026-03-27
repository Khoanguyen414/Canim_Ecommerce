import { create } from "zustand";
import { authApi } from "../api/auth.api";

interface AuthState {
  user: {
    email: string;
    roles: string[];
  } | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  login: async (email: string, password: string) => {
    const res = await authApi.login({ email, password });

    console.log("LOGIN RESPONSE:", res.data);

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    const { accessToken, refreshToken, roles } = res.data.result;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    set({
      accessToken,
      user: {
        email,
        roles,
      },
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null });
  },
}));
