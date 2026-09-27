import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authed' | 'anon'

  const refresh = useCallback(async () => {
    try {
      await api.adminMe();
      setStatus('authed');
    } catch {
      setStatus('anon');
    }
  }, []);

  useEffect(() => {
    // refresh() awaits api.adminMe() (a network call) before calling setState; this is
    // a fetch-on-mount effect, not a synchronous state write, so it can't be moved to render phase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(async (password) => {
    await api.adminLogin(password);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    await api.adminLogout();
    setStatus('anon');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ status, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
