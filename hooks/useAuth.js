"use client"
import { useState, useEffect } from 'react';
import { getCurrentUser, getToken, logout as authLogout } from '@/lib/auth';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getCurrentUser();
    setUser(userData);
    setLoading(false);
  }, []);

  const logout = () => {
    authLogout();
  };

  return { user, loading, logout };
}