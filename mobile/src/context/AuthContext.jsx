/**
 * AuthContext.jsx — Patient Authentication & Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth.api.js';
import { secureStorage } from '../services/secureStorage.service.js';
import { request } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, client }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedToken() {
      try {
        if (secureStorage) {
          const token = await secureStorage.getItem('memora_auth_token');
          if (token && client) {
            client.setAuthToken(token);
            const userData = await getCurrentUser(client);
            if (userData) {
              setUser(userData?.data || userData);
              return;
            }
          }
        }
        if (request) {
          const res = await request('/auth/me');
          if (res?.success && res?.data?.user) {
            setUser(res.data.user);
          }
        }
      } catch (err) {
        if (secureStorage) await secureStorage.removeItem('memora_auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadSavedToken();
  }, [client]);

  const handleLogin = async (email, password) => {
    try {
      if (apiLogin) {
        const res = await apiLogin(email, password, client);
        const token = res?.data?.token;
        const userData = res?.data?.user || res?.user;
        if (token && secureStorage) {
          await secureStorage.setItem('memora_auth_token', token);
        }
        if (userData) setUser(userData);
        return res;
      }
      if (request) {
        const res = await request('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        if (res?.success && res?.data?.user) {
          setUser(res.data.user);
        }
        return res;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      if (apiLogout) await apiLogout(client);
      if (request) await request('/auth/logout', { method: 'POST' }).catch(() => {});
      if (secureStorage) await secureStorage.removeItem('memora_auth_token');
    } catch {
      // Ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        isLoading: loading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
