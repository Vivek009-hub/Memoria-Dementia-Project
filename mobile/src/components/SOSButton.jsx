/**
 * SOSButton.jsx — Prominent, elder-friendly emergency SOS button component
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import * as safetyApi from '../api/safetyApi.js';
import { queueOfflineItem } from '../services/offlineSync.service.js';

export function SOSButton({ isOnline, onSOSTriggered, currentLocation }) {
  const [status, setStatus] = useState('IDLE'); // IDLE, COUNTDOWN, TRIGGERED, FAILED
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

  const handlePress = () => {
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

      if (!isOnline) {
        queueOfflineItem({ type: 'SOS', location: locationData, clientEventId: `sos_${Date.now()}` });
        setStatus('TRIGGERED');
        setActiveEvent({ _id: 'queued', status: 'QUEUED_OFFLINE' });
        if (onSOSTriggered) onSOSTriggered();
        return;
      }

      const res = await safetyApi.triggerSOS(locationData, `sos_${Date.now()}`);
      if (res.success && res.data) {
        setStatus('TRIGGERED');
        setActiveEvent(res.data);
        if (onSOSTriggered) onSOSTriggered(res.data);
      }
    } catch {
      setStatus('FAILED');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {status === 'IDLE' && (
        <button
          onClick={handlePress}
          className="w-56 h-56 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl border-4 border-red-400 focus:outline-none transition-all sos-pulse-animation"
          aria-label="Trigger Emergency SOS"
        >
          <AlertTriangle className="w-20 h-20 mb-2 stroke-[2.5]" />
          <span className="text-3xl font-extrabold tracking-wider">EMERGENCY</span>
          <span className="text-xl font-bold uppercase tracking-widest text-red-200">SOS</span>
        </button>
      )}

      {status === 'COUNTDOWN' && (
        <div className="w-64 p-6 bg-red-950/90 border-4 border-red-500 rounded-3xl text-center shadow-2xl flex flex-col items-center">
          <p className="text-xl font-bold text-red-200 mb-2">Sending Emergency Alert in</p>
          <p className="text-6xl font-black text-white my-2">{countdown}</p>
          <p className="text-sm text-red-300 mb-4">Tap CANCEL if pressed by mistake</p>
          <button
            onClick={cancelCountdown}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xl rounded-2xl border-2 border-slate-600 flex items-center justify-center space-x-2 touch-target-xl"
          >
            <XCircle className="w-8 h-8 text-red-400" />
            <span>CANCEL</span>
          </button>
        </div>
      )}

      {status === 'TRIGGERED' && (
        <div className="w-full max-w-sm p-6 bg-emerald-950/80 border-2 border-emerald-500 rounded-3xl text-center shadow-xl flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mb-3" />
          <h2 className="text-2xl font-extrabold text-emerald-300">HELP IS ON THE WAY</h2>
          <p className="text-base text-emerald-100 mt-2 font-medium">
            Your emergency contacts and caregivers have been notified with your current safety status.
          </p>
          {activeEvent?._id === 'queued' && (
            <span className="mt-3 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
              Queued Offline — Will sync automatically
            </span>
          )}
          <button
            onClick={() => setStatus('IDLE')}
            className="mt-5 w-full py-3 bg-slate-800 text-slate-200 rounded-xl font-bold text-base border border-slate-700"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="w-full max-w-sm p-5 bg-red-950/90 border-2 border-red-500 rounded-2xl text-center">
          <p className="text-lg font-bold text-red-200">Failed to send alert.</p>
          <button
            onClick={executeSOS}
            className="mt-3 px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-lg"
          >
            RETRY NOW
          </button>
        </div>
      )}
    </div>
  );
}
