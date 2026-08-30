/**
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
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
