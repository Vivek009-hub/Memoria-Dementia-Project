/**
 * App.jsx — Memora Patient, Caregiver & Admin Mobile & Web Application Shell
 *
 * Integrates Admin Dashboard, Caregiver Support Dashboard, Safety Companion Dashboard, Memory Vault, Reminders & Daily Routine, Community & Meeting Circle, Notifications & Activity Center, and B11 AI Assistance.
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, RefreshCw, BookOpen, Bot, Clock, Users, Bell, UserCheck, ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SafetyProvider, useSafety } from './context/SafetyContext.jsx';
import { MemoriesScreen } from './screens/MemoriesScreen.jsx';
import { RemindersScreen } from './screens/RemindersScreen.jsx';
import { CommunityScreen } from './screens/CommunityScreen.jsx';
import { NotificationsScreen } from './screens/NotificationsScreen.jsx';
import { SafetyDashboardScreen } from './screens/SafetyDashboardScreen.jsx';
import { AIAssistantScreen } from './screens/AIAssistantScreen.jsx';
import { CaregiverDashboardScreen } from './screens/CaregiverDashboardScreen.jsx';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen.jsx';
import { getCurrentCoordinates } from './services/location.service.js';
import * as safetyApi from './api/safetyApi.js';
import * as notificationsApi from './api/notifications.api.js';
import { defaultApiClient } from './api/client.js';

function Dashboard() {
  const { user, login } = useAuth();
  const { isOnline, pendingQueueCount, refreshSafetyData } = useSafety();

  const isCaregiver = user?.role === 'CAREGIVER';
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('assistant'); // 'reminders' | 'memories' | 'community' | 'notifications' | 'assistant' | 'safety' | 'caregiver' | 'admin'
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin');
    } else if (isCaregiver) {
      setActiveTab('caregiver');
    }
  }, [isAdmin, isCaregiver]);

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      notificationsApi
        .getUnreadCount()
        .then((res) => {
          if (res.data?.unreadCount !== undefined) {
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user, activeTab]);

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
        const mockCoords = { latitude: 28.6139, longitude: 77.2090, accuracy: 10 };
        setCurrentLocation(mockCoords);
      }
    }

    updateLoc();
    const interval = setInterval(updateLoc, 30000);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 pb-16 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between py-4 border-b border-slate-800 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Memora</h1>
            <p className="text-xs text-slate-400 font-medium">
              {isAdmin
                ? 'Platform Administration Control Center'
                : isCaregiver
                ? 'Caregiver Authorized Support Hub'
                : 'Patient & Caregiver Safety Platform'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl space-x-1 overflow-x-auto">
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Admin</span>
              </button>
            )}

            {isCaregiver && (
              <button
                onClick={() => setActiveTab('caregiver')}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'caregiver'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Caregiver</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'assistant'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'reminders'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Reminders</span>
            </button>

            <button
              onClick={() => setActiveTab('memories')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'memories'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Memories</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'community'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'notifications'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full ml-1">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                activeTab === 'safety'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-red-400" />
              <span>Safety</span>
            </button>
          </nav>
        )}

        {/* Online / Offline Status Badge */}
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

      {/* Patient / Caregiver / Admin Auth Check */}
      {!user ? (
        <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Memora Sign In</h2>
          <p className="text-sm text-slate-400 text-center mb-6">Sign in to your patient, caregiver, or admin account.</p>
          
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
                placeholder="admin@memora.com"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-lg focus:outline-none focus:border-indigo-500"
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
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xl rounded-xl shadow-lg touch-target-xl"
            >
              Sign In
            </button>
          </form>
        </div>
      ) : (
        <main className="w-full max-w-4xl">
          {activeTab === 'admin' && <AdminDashboardScreen />}
          {activeTab === 'caregiver' && <CaregiverDashboardScreen />}
          {activeTab === 'assistant' && (
            <AIAssistantScreen onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'safety' && <SafetyDashboardScreen />}
          {activeTab === 'notifications' && (
            <NotificationsScreen
              onNavigate={(tab) => setActiveTab(tab)}
              onUnreadCountChange={(count) => setUnreadCount(count)}
            />
          )}
          {activeTab === 'reminders' && <RemindersScreen patientId={user.id} />}
          {activeTab === 'memories' && <MemoriesScreen patientId={user.id} />}
          {activeTab === 'community' && <CommunityScreen patientId={user.id} />}
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
