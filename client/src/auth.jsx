import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore the session on page load.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false));
  }, [logout]);

  const authenticate = useCallback(async (mode, form) => {
    const { token, user } = await api[mode](form);
    tokenStore.set(token);
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({ user, booting, login: (f) => authenticate('login', f), signup: (f) => authenticate('signup', f), logout }),
    [user, booting, authenticate, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
