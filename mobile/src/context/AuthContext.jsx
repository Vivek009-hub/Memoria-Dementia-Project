/**
<<<<<<< HEAD
 * AuthContext.jsx — Authentication State Provider
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, logout, getCurrentUser } from '../api/auth.api.js';
import { secureStorage } from '../services/secureStorage.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, client }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedToken() {
      try {
        const token = await secureStorage.getItem('memora_auth_token');
        if (token && client) {
          client.setAuthToken(token);
          const userData = await getCurrentUser(client);
          setUser(userData?.data || userData);
        }
      } catch (err) {
        await secureStorage.removeItem('memora_auth_token');
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedToken();
  }, [client]);

  const handleLogin = async (email, password) => {
    const res = await login(email, password, client);
    const token = res?.data?.token;
    const userData = res?.data?.user || res?.user;
    if (token) {
      await secureStorage.setItem('memora_auth_token', token);
    }
    setUser(userData);
    return res;
  };

  const handleLogout = async () => {
    await logout(client);
    await secureStorage.removeItem('memora_auth_token');
=======
 * AuthContext.jsx — Patient Authentication & Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await request('/auth/me');
        if (res.success && res.data.user) {
          setUser(res.data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
>>>>>>> 7c9965d9590bdc0c5177cb353c60eab343a31e8b
    setUser(null);
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
=======
    <AuthContext.Provider value={{ user, loading, login, logout }}>
>>>>>>> 7c9965d9590bdc0c5177cb353c60eab343a31e8b
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
<<<<<<< HEAD
  return useContext(AuthContext);
=======
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
>>>>>>> 7c9965d9590bdc0c5177cb353c60eab343a31e8b
}
