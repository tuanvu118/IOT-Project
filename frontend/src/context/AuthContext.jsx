import { createContext, useEffect, useState } from "react";
import { getMe } from "../services/authService";
import { getStoredToken, setStoredToken } from "../services/api";

export const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    isAdmin: user.isAdmin ?? user.is_admin ?? false,
    avatarUrl: user.avatarUrl ?? user.avatar_url,
    phoneNumber: user.phoneNumber ?? user.phone_number,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const profile = await getMe(token);
        if (isMounted) {
          setUser(normalizeUser(profile));
        }
      } catch {
        setStoredToken(null);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (authData) => {
    const nextToken = authData.access_token || authData.token || authData.accessToken;
    const nextUser = authData.user || authData;

    setStoredToken(nextToken);
    setToken(nextToken || null);
    setUser(normalizeUser(nextUser));
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(normalizeUser(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthLoading,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
