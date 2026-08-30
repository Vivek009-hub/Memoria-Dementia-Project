import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { DashboardPlaceholder } from '../pages/DashboardPlaceholder.jsx';
import { DesignSystemShowcase } from '../pages/DesignSystemShowcase.jsx';

export function AppRoutes() {
  const { role } = useAuth();

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
        <Route index element={<DashboardPlaceholder title="Overview Dashboard" />} />
        <Route path="games" element={<DashboardPlaceholder title="Cognitive Games" module="F4 Module" />} />
        <Route path="memories" element={<DashboardPlaceholder title="Memory Assistance" module="F5 Module" />} />
        <Route path="reminders" element={<DashboardPlaceholder title="Smart Reminders" module="F6 Module" />} />
        <Route path="community" element={<DashboardPlaceholder title="Community Sessions" module="F7 Module" />} />
        <Route path="meetings" element={<DashboardPlaceholder title="Meeting Circle" module="F8 Module" />} />
        <Route path="assistant" element={<DashboardPlaceholder title="AI Assistant" module="F11 Module" />} />
        <Route path="notifications" element={<DashboardPlaceholder title="Notifications" module="F9 Module" />} />
        <Route path="analytics" element={<DashboardPlaceholder title="Cognitive Progress Analytics" module="F10 Module" />} />
        <Route path="safety" element={<DashboardPlaceholder title="Safety & Location Monitoring" module="F12 Module" />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
