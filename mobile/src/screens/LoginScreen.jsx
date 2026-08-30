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
    <div
      style={{
        padding: '28px',
        backgroundColor: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '32px', color: colors.primary, marginBottom: '24px' }}>Memora Patient Login</h1>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {errorMsg && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#FEE2E2',
              color: colors.danger,
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div>
          <label style={{ fontSize: '18px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '20px',
              borderRadius: '10px',
              border: `2px solid ${colors.border}`,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '18px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '20px',
              borderRadius: '10px',
              border: `2px solid ${colors.border}`,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <ElderButton title={submitting ? 'Logging in...' : 'Log In'} onClick={handleSubmit} disabled={submitting} />
      </form>
    </div>
  );
}
