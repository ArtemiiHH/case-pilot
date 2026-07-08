import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, logout as logoutApi } from "./lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // 'loading' | 'authed' | 'unauthed'
  const [firm, setFirm] = useState(null);

  const refresh = useCallback(() => {
    return getMe()
      .then((data) => {
        setFirm(data);
        setStatus("authed");
      })
      .catch(() => {
        setFirm(null);
        setStatus("unauthed");
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutApi().catch(() => {});
    setFirm(null);
    setStatus("unauthed");
  }, []);

  return (
    <AuthContext.Provider value={{ status, firm, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
