/**
 * App.jsx — Memora Safety & Assistance Mobile Application Main Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, RefreshCw } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SafetyProvider, useSafety } from './context/SafetyContext.jsx';
import { SOSButton } from './components/SOSButton.jsx';
import { FallDetector } from './components/FallDetector.jsx';
import { GeofenceStatus } from './components/GeofenceStatus.jsx';
import { EmergencyContacts } from './components/EmergencyContacts.jsx';
import { SafetyHistory } from './components/SafetyHistory.jsx';
import { getCurrentCoordinates } from './services/location.service.js';
import * as safetyApi from './api/safetyApi.js';
import { defaultApiClient } from './api/client.js';

function Dashboard() {
  const { user, login } = useAuth();
  const { isOnline, geofences, safetyEvents, pendingQueueCount, refreshSafetyData } = useSafety();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Fetch current GPS location and sync periodically
  useEffect(() => {
    async function updateLoc() {
      try {
        const coords = await getCurrentCoordinates();
        setCurrentLocation(coords);
        if (isOnline && user?.role === 'PATIENT' && safetyApi.sendLocation) {
          await safetyApi.sendLocation(coords.latitude, coords.longitude, coords.accuracy);
        }
      } catch {
        // Fallback default coordinates for demonstration
        const mockCoords = { latitude: 28.6139, longitude: 77.2090, accuracy: 10 };
        setCurrentLocation(mockCoords);
      }
    }

    updateLoc();
    const interval = setInterval(updateLoc, 30000); // Send location update every 30s
    return () => clearInterval(interval);
  }, [isOnline, user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 pb-12 font-sans selection:bg-red-500 selection:text-white">
      {/* Header Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-4 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-red-500 fill-red-500/20" />
          <h1 className="text-2xl font-black tracking-tight text-white">Memora Safety</h1>
        </div>

        <div className="flex items-center space-x-2">
          {isOnline ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 flex items-center space-x-1">
              <Wifi className="w-3.5 h-3.5" />
              <span>ONLINE</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40 flex items-center space-x-1">
              <WifiOff className="w-3.5 h-3.5" />
              <span>OFFLINE ({pendingQueueCount})</span>
            </span>
          )}

          <button
            onClick={refreshSafetyData}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white active:rotate-180 transition-transform"
            aria-label="Refresh safety data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Patient Auth Check / Quick Login Screen */}
      {!user ? (
        <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Patient Sign In</h2>
          <p className="text-sm text-slate-400 text-center mb-6">Sign in to sync your safety companion device.</p>
          
          {loginError && (
            <div className="p-3 mb-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-sm text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="patient@memora.com"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-lg focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-lg focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xl rounded-xl shadow-lg touch-target-xl"
            >
              Sign In to Safety Companion
            </button>
          </form>
        </div>
      ) : (
        <main className="w-full max-w-md flex flex-col items-center space-y-6">
          {/* Elder-Friendly Emergency SOS Section */}
          <section className="w-full flex justify-center py-2">
            <SOSButton
              isOnline={isOnline}
              currentLocation={currentLocation}
              onSOSTriggered={refreshSafetyData}
            />
          </section>

          {/* Geofence Status Card */}
          <GeofenceStatus geofences={geofences} />

          {/* Fall Detection Monitor Card */}
          <FallDetector currentLocation={currentLocation} />

          {/* Emergency Contacts Card */}
          <EmergencyContacts />

          {/* Safety Event History Card */}
          <SafetyHistory events={safetyEvents} />
        </main>
      )}
    </div>
  );
}

export default function App({ client = defaultApiClient }) {
  return (
    <AuthProvider client={client}>
      <SafetyProvider client={client}>
        <Dashboard />
      </SafetyProvider>
    </AuthProvider>
  );
}
