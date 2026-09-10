import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi } from "../services/apiModules";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const fetchCurrentUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                  setLoading(false);
                  return;
            }

            try {
                  const res = await authApi.getMe();
                  if (res.success) {
                        setUser(res.data);
                  } else {
                        localStorage.removeItem("token");
                        setUser(null);
                  }
            } catch (err) {
                  console.error("Failed to fetch user:", err);
                  localStorage.removeItem("token");
                  setUser(null);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchCurrentUser();
      }, []);

      const login = async (email, password) => {
            setError(null);
            try {
                  const res = await authApi.login({ email, password });
                  if (res.success && res.token) {
                        localStorage.setItem("token", res.token);
                        setUser(res.user);
                        return res;
                  } else {
                        throw new Error(res.message || "Login failed");
                  }
            } catch (err) {
                  const message = err.response?.data?.message || err.message || "An error occurred during login";
                  setError(message);
                  throw new Error(message);
            }
      };

      const logout = () => {
            localStorage.removeItem("token");
            setUser(null);
      };

      return (
            <AuthContext.Provider value={{ user, loading, error, login, logout, refreshUser: fetchCurrentUser }}>
                  {children}
            </AuthContext.Provider>
      );
};

export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
            throw new Error("useAuth must be used within an AuthProvider");
      }
      return context;
};