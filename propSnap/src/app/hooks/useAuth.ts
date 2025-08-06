import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return { isLoggedIn, loading, login, logout };
};