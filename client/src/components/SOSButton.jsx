/**
 * SOSButton.jsx — Emergency SOS Button Component
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import * as safetyApi from '../api/safety.api.js';
import { ElderButton } from './ElderButton.jsx';

export function SOSButton({ onClick, label = '🚨 SOS Emergency', isOnline = true, onSOSTriggered, currentLocation, style }) {
  const [status, setStatus] = useState('IDLE');
  const [countdown, setCountdown] = useState(5);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    let timer;
    if (status === 'COUNTDOWN' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (status === 'COUNTDOWN' && countdown === 0) {
      executeSOS();
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const handlePress = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (status === 'IDLE') {
      setCountdown(5);
      setStatus('COUNTDOWN');
    }
  };

  const cancelCountdown = () => {
    setStatus('IDLE');
    setCountdown(5);
  };

  const executeSOS = async () => {
    try {
      const locationData = currentLocation
        ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy,
          }
        : null;

      const res = await safetyApi.triggerSOS('MANUAL_SOS', locationData);
      if (res?.success && res?.data) {
        setStatus('TRIGGERED');
        setActiveEvent(res.data);
        if (onSOSTriggered) onSOSTriggered(res.data);
      } else {
        setStatus('TRIGGERED');
        if (onSOSTriggered) onSOSTriggered();
      }
    } catch {
      setStatus('FAILED');
    }
  };

  if (style) {
    return (
      <ElderButton
        title={label}
        onClick={handlePress}
        variant="danger"
        style={{
          fontSize: '22px',
          fontWeight: '600',
          minHeight: '68px',
          backgroundColor: '#C95C5C',
          color: '#FFFFFF',
          ...style,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {status === 'IDLE' && (
        <button
          onClick={handlePress}
          className="w-52 h-52 rounded-full bg-[#C95C5C] hover:bg-[#D96C6C] active:scale-95 text-white flex flex-col items-center justify-center shadow-lg border-4 border-[#E88888] focus:outline-none transition-all"
          aria-label="Trigger Emergency SOS"
        >
          <AlertTriangle className="w-16 h-16 mb-1" />
          <span className="text-2xl font-bold tracking-wider uppercase">EMERGENCY</span>
          <span className="text-lg font-semibold tracking-widest text-white/90">SOS</span>
        </button>
      )}

      {status === 'COUNTDOWN' && (
        <div className="w-64 p-6 bg-[#252525] border-2 border-[#C95C5C] rounded-xl text-center shadow-xl flex flex-col items-center">
          <p className="text-base font-semibold text-[#C95C5C] mb-1">Sending Emergency Alert in</p>
          <p className="text-5xl font-extrabold text-[#E8E8E8] my-2">{countdown}</p>
          <p className="text-xs text-[#A0A0A0] mb-4">Tap CANCEL if pressed by mistake</p>
          <button
            onClick={cancelCountdown}
            className="w-full py-3 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#E8E8E8] font-semibold text-sm rounded-lg border border-[#343434] flex items-center justify-center space-x-2 transition-colors"
          >
            <XCircle className="w-5 h-5 text-[#C95C5C]" />
            <span>CANCEL</span>
          </button>
        </div>
      )}

      {status === 'TRIGGERED' && (
        <div className="w-full max-w-sm p-6 bg-[#252525] border-2 border-[#8BAA78] rounded-xl text-center shadow-lg flex flex-col items-center">
          <ShieldCheck className="w-14 h-14 text-[#8BAA78] mb-2" />
          <h2 className="text-xl font-semibold text-[#8BAA78]">ALERT SENT</h2>
          <p className="text-sm text-[#A0A0A0] mt-2 font-normal leading-relaxed">
            Your emergency contacts and caregivers have been notified with your location.
          </p>
          <button
            onClick={() => setStatus('IDLE')}
            className="mt-4 w-full py-2.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#E8E8E8] rounded-lg font-medium text-sm border border-[#343434] transition-colors"
          >
            Back to Safety View
          </button>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="w-full max-w-sm p-5 bg-[#252525] border-2 border-[#C95C5C] rounded-xl text-center">
          <p className="text-sm font-semibold text-[#C95C5C]">Failed to send emergency alert.</p>
          <button
            onClick={executeSOS}
            className="mt-3 px-5 py-2.5 bg-[#C95C5C] text-white font-semibold rounded-lg text-sm transition-colors"
          >
            RETRY NOW
          </button>
        </div>
      )}
    </div>
  );
}

