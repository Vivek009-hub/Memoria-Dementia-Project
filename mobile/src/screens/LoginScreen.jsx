/**
 * LoginScreen.jsx — Patient Auth Screen
 */

import React, { useState } from 'react';
import { colors } from '../theme/colors.js';
import { ElderButton } from '../components/ElderButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginScreen({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6 bg-memora-bg">
      <div className="w-full bg-memora-surface border border-memora-border rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-memora-accent uppercase tracking-wider">Memora Login</h1>
          <p className="text-sm text-memora-text-muted">Sign in to your Memora patient or caregiver account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 rounded-2xl text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-memora-text block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@memora.com"
              className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium focus:outline-none focus:border-memora-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-memora-text block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium focus:outline-none focus:border-memora-accent transition-colors"
            />
          </div>

          <ElderButton title={submitting ? 'Logging in...' : 'Log In'} onClick={handleSubmit} disabled={submitting} />
        </form>
      </div>
    </div>
  );
}
