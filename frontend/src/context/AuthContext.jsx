import { useState, useEffect } from 'react';
import api from '../api/client';
import { AuthContext } from './auth-context-instance';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (!cancelled) setUser(res.data);
      } catch {
        localStorage.removeItem('token');
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    await refreshUser();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
