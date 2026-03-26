import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "@/shared/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const stored = localStorage.getItem("rezell_user");
        if (!stored) return;

        const parsedUser = JSON.parse(stored);
        if (!isMounted) return;

        setUser(parsedUser);

        // Validate cookie-based session; clear stale local user if session expired.
        await authAPI.getMe();
      } catch {
        if (!isMounted) return;
        localStorage.removeItem("rezell_user");
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!localStorage.getItem("rezell_user")) {
      setLoading(false);
    } else {
      bootstrapAuth();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Token lives in httpOnly cookie — we only cache user info in localStorage
  const login = (userData) => {
    localStorage.setItem("rezell_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("rezell_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
