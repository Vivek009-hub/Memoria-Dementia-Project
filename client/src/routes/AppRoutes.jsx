import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { PatientLayout } from '../layouts/PatientLayout.jsx';
import { CaregiverLayout } from '../layouts/CaregiverLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';

import { ProtectedRoute } from './ProtectedRoute.jsx';

import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { GameLibraryPage } from '../pages/games/GameLibraryPage.jsx';
import { GamePlayPage } from '../pages/games/GamePlayPage.jsx';
import { DesignSystemShowcase } from '../pages/DesignSystemShowcase.jsx';

// Fully Functional Phase Pages
import { MemoriesPage } from '../pages/MemoriesPage.jsx';
import { RemindersPage } from '../pages/RemindersPage.jsx';
import { CommunityPage } from '../pages/CommunityPage.jsx';
import { MeetingsPage } from '../pages/MeetingsPage.jsx';
import { AIAssistantPage } from '../pages/AIAssistantPage.jsx';
import { NotificationsPage } from '../pages/NotificationsPage.jsx';
import { SafetyPage } from '../pages/SafetyPage.jsx';
import { CaregiverDashboardPage } from '../pages/CaregiverDashboardPage.jsx';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.jsx';
import { AnalyticsPage } from '../pages/AnalyticsPage.jsx';
import { PatientProfilePage } from '../pages/PatientProfilePage.jsx';

export function AppRoutes() {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const AppLayout = role === 'ADMIN' ? AdminLayout : role === 'CAREGIVER' ? CaregiverLayout : PatientLayout;

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/design-system" element={<DesignSystemShowcase />} />
      </Route>

      {/* Authenticated Dashboard Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            role === 'ADMIN' ? (
              <AdminDashboardPage />
            ) : role === 'CAREGIVER' ? (
              <CaregiverDashboardPage onNavigate={(path) => navigate(path)} />
            ) : (
              <MemoriesPage patientId={user?._id} />
            )
          }
        />
        <Route path="profile" element={<PatientProfilePage />} />
        <Route path="games" element={<GameLibraryPage />} />
        <Route path="games/:gameId" element={<GamePlayPage />} />
        <Route path="memories" element={<MemoriesPage patientId={user?._id} />} />
        <Route path="reminders" element={<RemindersPage patientId={user?._id} />} />
        <Route path="community" element={<CommunityPage patientId={user?._id} />} />
        <Route path="meetings" element={<MeetingsPage patientId={user?._id} />} />
        <Route path="assistant" element={<AIAssistantPage patientId={user?._id} onNavigate={(path) => navigate(path)} />} />
        <Route path="notifications" element={<NotificationsPage onNavigate={(path) => navigate(path)} />} />
        <Route path="analytics" element={<AnalyticsPage patientId={user?._id} />} />
        <Route path="safety" element={<SafetyPage patientId={user?._id} />} />
        <Route path="caregiver" element={<CaregiverDashboardPage onNavigate={(path) => navigate(path)} />} />
        <Route path="admin" element={<AdminDashboardPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
