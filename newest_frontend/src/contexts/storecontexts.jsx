// src/contexts/storecontexts.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(undefined);

// helper to remove sensitive fields before storing user client-side
const sanitizeUser = (user) => {
  if (!user) return null;
  // create shallow copy and remove sensitive keys
  const { password, ...rest } = user;
  // if you want to remove more keys, add them here, e.g. const { password, secret, ssn, ...rest } = user;
  return rest;
};

export const StoreProvider = ({ children }) => {
  // token from localStorage (optional; backend may rely on httpOnly cookie)
  const [token, setToken] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      return sanitizeUser(parsed);
    } catch {
      return null;
    }
  });

  // loading indicates we're verifying session (used by route guards)
  const [loading, setLoading] = useState(true);

  const isLoggedIn = useMemo(() => !!token || !!user, [token, user]);

  // keep localStorage in sync (still useful for client-side state)
  useEffect(() => {
    try {
      const toStore = sanitizeUser(user);
      if (toStore && Object.keys(toStore).length > 0) {
        localStorage.setItem("user", JSON.stringify(toStore));
      } else {
        localStorage.removeItem("user");
      }
    } catch { }
  }, [user]);

  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    } catch { }
  }, [token]);

  // Call backend to verify session / get current user.
  // This supports both cookie-based auth (httpOnly cookie) and token-in-localStorage flows.
  const verifySession = async () => {
    setLoading(true);
    try {
      const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";
      // Call a safe endpoint that returns the logged user when valid
      const res = await fetch(`${BASE}/auth/verify/me`, {
        method: "GET",
        credentials: "include", // required if backend uses cookies
        headers: {
          "Content-Type": "application/json",
          // include local token if server expects Authorization header (optional)
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        // Not authorized or no session
        setUser(null);
        // If server provides a new token or info, you can parse here.
        // Optionally clear token: setToken(null)
        setLoading(false);
        return null;
      }

      const data = await res.json();
      // expected: { user: {...} } or user object — adapt if needed
      const fetchedUser = data.user ?? data;
      console.log(fetchedUser)
      setUser(sanitizeUser(fetchedUser));
      // If backend returns token rotation, handle it like:
      // if (data.token) setToken(data.token)
      setLoading(false);
      return fetchedUser;
    } catch (err) {
      console.error("verifySession error:", err);
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  // Run session verification once on mount
  useEffect(() => {
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Centralized login: save token (if provided) and user
  const login = ({ token: newToken, user: newUser }) => {
    if (newToken) setToken(newToken);
    if (newUser) setUser(sanitizeUser(newUser));
  };

  // Logout: clear local state and optionally call backend logout
  const LogoutTrue = async (callBackend = true) => {
    try {
      if (callBackend) {
        const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";
        await fetch(`${BASE}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).catch(() => { });
      }
    } catch (e) {
      // swallow
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  // fetch fresh user on demand
  const getUser = async () => {
    return verifySession();
  };

  // helper for role checking
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || (Array.isArray(user.roles) && user.roles.includes(role));
  };

  const value = useMemo(
    () => ({ token, isLoggedIn, user, login, LogoutTrue, getUser, verifySession, loading, hasRole }),
    [token, isLoggedIn, user, loading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside a StoreProvider");
  return ctx;
};
