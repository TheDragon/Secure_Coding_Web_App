import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/http.js";
import { setAccessToken, clearAccessToken } from "./tokenStore.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthState = useCallback(({ token, user }) => {
    setAccessToken(token);
    setUser(user || null);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const res = await api.post("/auth/refresh");
      const { token, user: me } = res.data || {};
      if (token && me) {
        setAuthState({ token, user: me });
      } else {
        clearAccessToken();
        setUser(null);
      }
    } catch (e) {
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setAuthState]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const handler = () => {
      clearAccessToken();
      setUser(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    clearAccessToken();
    setUser(null);
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, []);

  const value = {
    user,
    loading,
    setAuthState,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
