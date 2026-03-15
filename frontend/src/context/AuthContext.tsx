import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "../api/axios";
import { AxiosError } from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "STAFF" | "ADMIN";
  skills?: string[];
  experienceLevel?: string;
  educationLevel?: string;
  yearsOfExperience?: number;
  preferredRoles?: string[];
  locationPreference?: string;
  profileCompleted?: boolean;
  cvUrl?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string;
  setToken: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize from localStorage immediately
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem("token") || "";
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = {
          ...res.data,
          skills: res.data.skills || []
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
      } catch (err) {
        const error = err as AxiosError;
        console.error("Auth fetch failed:", error.response?.data || error.message);
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};