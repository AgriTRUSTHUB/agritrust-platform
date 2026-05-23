import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiUrl } from "@/utils/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  farmName: string | null;
  region: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  farmScoreRating: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = "agritrust_token";
const AuthContext = createContext<AuthContextType | null>(null);

let _tokenRef: string | null = null;
setAuthTokenGetter(() => _tokenRef);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeToken = useCallback((t: string | null) => {
    _tokenRef = t;
    setToken(t);
  }, []);

  async function fetchMe(t: string) {
    try {
      const res = await fetch(apiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = (await res.json()) as AuthUser;
        setUser(data);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
        storeToken(null);
      }
    } catch {
      // network error — keep token, try again later
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((stored) => {
      if (stored) {
        storeToken(stored);
        fetchMe(stored);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? "Login failed");
    }
    const data = (await res.json()) as { token: string; user: AuthUser };
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    storeToken(data.token);
    setUser(data.user);
  }

  async function register(
    name: string,
    email: string,
    password: string,
    role: string
  ) {
    const res = await fetch(apiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? "Registration failed");
    }
    const data = (await res.json()) as { token: string; user: AuthUser };
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    storeToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    // Clear push token on the server (best-effort)
    if (_tokenRef) {
      fetch(apiUrl("/api/auth/push-token"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${_tokenRef}` },
      }).catch(() => {});
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    storeToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
