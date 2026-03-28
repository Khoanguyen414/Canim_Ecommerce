import api from "../utils/axios";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  register: (data: {
    email: string;
    fullName: string;
    password: string;
    phone?: string;
  }) => api.post("/auth/register", data),

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }),
};
