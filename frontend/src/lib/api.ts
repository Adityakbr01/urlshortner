import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ---------- Types ----------
export interface User {
  id: number | string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ShortUrl {
  id: number | string;
  original_url: string;
  short_code: string;
  short_url: string;
  clicks?: number;
  created_at?: string;
}

// ---------- API calls ----------
export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post("/login", { email, password });
  return data.data ?? data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
): Promise<AuthResponse> {
  const { data } = await api.post("/register", {
    name,
    email,
    password,
    password_confirmation,
  });
  return data.data ?? data;
}

export async function logoutApi(): Promise<void> {
  try {
    await api.post("/logout");
  } finally {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

export async function fetchUrlsApi(): Promise<ShortUrl[]> {
  const { data } = await api.get("/urls");
  return data.data ?? data;
}

export async function shortenUrlApi(original_url: string): Promise<ShortUrl> {
  const { data } = await api.post("/shorten", { original_url });
  return data.data ?? data;
}
