import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import i18n from '../i18n/i18n';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.preferredLanguage) {
        i18n.changeLanguage(u.preferredLanguage);
        localStorage.setItem('gardenLang', u.preferredLanguage);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const userData = res.data;
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.preferredLanguage) {
      i18n.changeLanguage(userData.preferredLanguage);
      localStorage.setItem('gardenLang', userData.preferredLanguage);
    }
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const userData = res.data;
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const changeLanguage = async (lang) => {
    localStorage.setItem('gardenLang', lang);
    await i18n.changeLanguage(lang);
    // Force re-render by updating state
    if (user) {
      try {
        await authAPI.updateLanguage(lang);
        const updated = { ...user, preferredLanguage: lang };
        setUser({ ...updated });
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
    } else {
      // Even without user, force re-render
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, changeLanguage }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
