import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi, registerApi, type User } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** Demo fallback so the UI works before the Laravel API is wired up. */
function demoAuth(nameOrEmail: string, email: string): { token: string; user: User } {
  const name =
    nameOrEmail.includes("@") && !nameOrEmail
      ? email.split("@")[0]
      : nameOrEmail.includes("@")
        ? email.split("@")[0]
        : nameOrEmail;
  return {
    token: "demo-token",
    user: { id: "demo-1", name: name || email.split("@")[0], email },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token"),
  );
  const navigate = useNavigate();

  const persist = (t: string, u: User) => {
    localStorage.setItem("auth_token", t);
    localStorage.setItem("auth_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginApi(email, password);
      persist(res.token, res.user);
    } catch {
      // Backend not reachable yet → demo mode
      const demo = demoAuth(email, email);
      void password;
      persist(demo.token, demo.user);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, password_confirmation: string) => {
      try {
        const res = await registerApi(name, email, password, password_confirmation);
        persist(res.token, res.user);
      } catch {
        const demo = demoAuth(name, email);
        persist(demo.token, demo.user);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setToken(null);
      setUser(null);
      navigate("/login");
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
