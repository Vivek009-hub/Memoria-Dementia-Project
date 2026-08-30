/**
 * App.jsx — Mobile Safety Application Entrypoint
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { SafetyProvider } from './context/SafetyContext.jsx';
import { AppNavigator } from './navigation/AppNavigator.jsx';
import { defaultApiClient } from './api/client.js';

export default function App({ client = defaultApiClient }) {
  return (
    <AuthProvider client={client}>
      <SafetyProvider client={client}>
        <AppNavigator client={client} />
      </SafetyProvider>
    </AuthProvider>
  );
}
