import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('internhub_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('internhub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('internhub_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('internhub_token');
        localStorage.removeItem('internhub_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (token, nextUser) => {
    localStorage.setItem('internhub_token', token);
    localStorage.setItem('internhub_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data.token, res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    saveSession(res.data.token, res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('internhub_token');
    localStorage.removeItem('internhub_user');
    setUser(null);
  };

  const refreshMe = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    localStorage.setItem('internhub_user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const dashboardPath = (role) =>
  role === 'admin' ? '/dashboard/admin' : role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/student';
