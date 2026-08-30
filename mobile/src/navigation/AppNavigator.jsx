/**
 * AppNavigator.jsx — Screen Route Container & Fall Alert Overlay Integrator
 */

import React, { useState, useEffect } from 'react';
import { HeaderBar } from '../components/HeaderBar.jsx';
import { OfflineBanner } from '../components/OfflineBanner.jsx';
import { FallAlertModal } from '../components/FallAlertModal.jsx';
import { HomeScreen } from '../screens/HomeScreen.jsx';
import { SOSScreen } from '../screens/SOSScreen.jsx';
import { SafetyEventScreen } from '../screens/SafetyEventScreen.jsx';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen.jsx';
import { LoginScreen } from '../screens/LoginScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSafety } from '../context/SafetyContext.jsx';
import { networkService } from '../services/network.service.js';
import { fallDetectionService } from '../services/fallDetection.service.js';
import { mobileNotificationService } from '../services/notification.service.js';

export function AppNavigator({ client }) {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});
  const [isOnline, setIsOnline] = useState(networkService.getStatus());
  const { isAuthenticated } = useAuth();
  const { isFallDetected, handleFallDetected, cancelFall, confirmFallAndReport } = useSafety();

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      setIsOnline(status);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fallDetectionService.onFallDetected((fallData) => {
      handleFallDetected(fallData);
    });
    fallDetectionService.onFallEscalated((payload) => {
      confirmFallAndReport(payload);
    });
  }, [handleFallDetected, confirmFallAndReport]);

  useEffect(() => {
    mobileNotificationService.setNavigationHandler((screenName, params) => {
      setCurrentScreen(screenName);
      if (params) setScreenParams(params);
    });
  }, []);

  const navigate = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    setScreenParams(params);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => navigate('Home')} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <HeaderBar title="Memora" />
      <OfflineBanner isOnline={isOnline} />

      <FallAlertModal
        isVisible={isFallDetected}
        onImOkay={() => {
          fallDetectionService.cancelFallEvent();
          cancelFall();
        }}
        onNeedHelp={(options) => {
          confirmFallAndReport(options);
        }}
      />

      {currentScreen === 'Home' && <HomeScreen onNavigate={navigate} />}
      {currentScreen === 'SOS' && <SOSScreen onNavigate={navigate} />}
      {currentScreen === 'SafetyEvent' && (
        <SafetyEventScreen onNavigate={navigate} eventId={screenParams.eventId} />
      )}
      {currentScreen === 'Contacts' && (
        <EmergencyContactsScreen onNavigate={navigate} client={client} />
      )}
      {currentScreen !== 'Home' &&
        currentScreen !== 'SOS' &&
        currentScreen !== 'SafetyEvent' &&
        currentScreen !== 'Contacts' && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h2>{currentScreen} Screen</h2>
            <button
              onClick={() => navigate('Home')}
              style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        )}
    </div>
  );
}
