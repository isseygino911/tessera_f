import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

const AuthContext = createContext(null);

// Saved addresses belong to customers only. A failed load leaves the list
// empty rather than failing auth.
async function fetchAddresses(user) {
  if (user.role === 'admin') return [];
  try {
    const data = await api.getAddresses();
    return data?.addresses ?? [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authed' | 'anon'
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);

  // Loads addresses before flipping to 'authed', so pages that mount on
  // 'authed' (checkout) see them in their first render.
  const signIn = useCallback(async (me) => {
    setAddresses(await fetchAddresses(me));
    setUser(me);
    setStatus('authed');
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await api.authMe();
      await signIn(me);
    } catch {
      setUser(null);
      setStatus('anon');
    }
  }, [signIn]);

  useEffect(() => {
    // refresh() awaits api.authMe() (a network call) before calling setState; this is
    // a fetch-on-mount effect, not a synchronous state write, so it can't be moved to render phase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const { user: me } = await api.authLogin({ email, password });
      await signIn(me);
    },
    [signIn]
  );

  const signup = useCallback(
    async ({ name, email, password }) => {
      const { user: me } = await api.authSignup({ name, email, password });
      await signIn(me);
    },
    [signIn]
  );

  // After checkout saved a new address.
  const reloadAddresses = useCallback(async () => {
    setAddresses(await fetchAddresses(user));
  }, [user]);

  const logout = useCallback(async () => {
    await api.authLogout();
    setUser(null);
    setAddresses([]);
    setStatus('anon');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        addresses,
        setAddresses,
        reloadAddresses,
        updateUser: setUser,
        login,
        signup,
        logout,
      }}
    >
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
