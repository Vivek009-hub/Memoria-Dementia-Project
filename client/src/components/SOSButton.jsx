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
          className="w-52 h-52 rounded-full bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl border-4 border-red-300 ring-8 ring-red-500/20 focus:outline-none transition-all cursor-pointer"
          aria-label="Trigger Emergency SOS"
        >
          <AlertTriangle className="w-16 h-16 mb-1 animate-pulse" />
          <span className="text-2xl font-black tracking-wider uppercase">EMERGENCY</span>
          <span className="text-xl font-black tracking-widest text-white/90">SOS</span>
        </button>
      )}

      {status === 'COUNTDOWN' && (
        <div className="w-72 p-6 bg-white border-4 border-rose-500 rounded-3xl text-center shadow-2xl flex flex-col items-center">
          <p className="text-base font-extrabold text-rose-600 mb-1">Sending Emergency Alert in</p>
          <p className="text-6xl font-black text-slate-900 my-2">{countdown}</p>
          <p className="text-xs font-semibold text-slate-500 mb-4">Tap CANCEL if pressed by mistake</p>
          <button
            onClick={cancelCountdown}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm rounded-2xl border border-slate-300 flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>CANCEL</span>
          </button>
        </div>
      )}

      {status === 'TRIGGERED' && (
        <div className="w-full max-w-sm p-6 bg-emerald-50 border-4 border-emerald-500 rounded-3xl text-center shadow-2xl flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-emerald-600 mb-2" />
          <h2 className="text-2xl font-black text-slate-900">ALERT SENT</h2>
          <p className="text-sm text-slate-600 mt-2 font-semibold leading-relaxed">
            Your emergency contacts and caregivers have been notified with your location.
          </p>
          <button
            onClick={() => setStatus('IDLE')}
            className="mt-4 w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm border border-slate-300 shadow-sm transition-all"
          >
            Back to Safety View
          </button>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="w-full max-w-sm p-6 bg-rose-50 border-4 border-rose-500 rounded-3xl text-center shadow-2xl">
          <p className="text-base font-extrabold text-rose-700">Failed to send emergency alert.</p>
          <button
            onClick={executeSOS}
            className="mt-4 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-sm shadow-lg transition-all"
          >
            RETRY NOW
          </button>
        </div>
      )}
    </div>
  );
}

