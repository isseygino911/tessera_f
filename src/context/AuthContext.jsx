import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authed' | 'anon'
  const [user, setUser] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await api.authMe();
      setUser(me);
      setStatus('authed');
    } catch {
      setUser(null);
      setStatus('anon');
    }
  }, []);

  useEffect(() => {
    // refresh() awaits api.authMe() (a network call) before calling setState; this is
    // a fetch-on-mount effect, not a synchronous state write, so it can't be moved to render phase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { user: me } = await api.authLogin({ email, password });
    setUser(me);
    setStatus('authed');
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const { user: me } = await api.authSignup({ name, email, password });
    setUser(me);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    await api.authLogout();
    setUser(null);
    setStatus('anon');
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
