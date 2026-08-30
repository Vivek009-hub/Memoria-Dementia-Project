/**
 * FallDetector.jsx — Fall detection simulation & patient confirm-safe component
 */

import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertOctagon } from 'lucide-react';
import * as safetyApi from '../api/safetyApi.js';

export function FallDetector({ currentLocation }) {
  const [activeFallEvent, setActiveFallEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [safeConfirmed, setSafeConfirmed] = useState(false);

  const simulateFallDetection = async () => {
    setLoading(true);
    setSafeConfirmed(false);
    try {
      const loc = currentLocation
        ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
        : null;
      const res = await safetyApi.sendFallEvent(0.92, loc);
      if (res.success && res.data) {
        setActiveFallEvent(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSafe = async () => {
    if (!activeFallEvent) return;
    setLoading(true);
    try {
      const res = await safetyApi.confirmFallSafe(activeFallEvent._id);
      if (res.success) {
        setSafeConfirmed(true);
        setActiveFallEvent(null);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-bold text-slate-100">Fall Detection Monitor</h3>
        </div>
        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
          Device Sensor Active
        </span>
      </div>

      {safeConfirmed && (
        <div className="p-3 mb-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center space-x-2 text-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">Confirmed Safe — Fall alert cancelled.</span>
        </div>
      )}

      {activeFallEvent ? (
        <div className="p-4 bg-amber-950/80 border-2 border-amber-500 rounded-2xl text-center">
          <AlertOctagon className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-2xl font-black text-amber-200">FALL DETECTED</h4>
          <p className="text-sm text-amber-100 mt-1 mb-4">Are you okay? If this was a mistake, tap below to confirm you are safe.</p>
          <button
            onClick={handleConfirmSafe}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xl rounded-xl shadow-lg touch-target-xl border-2 border-emerald-400 flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>I AM SAFE — CANCEL ALERT</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-2">
          <p className="text-xs text-slate-400 mb-3 text-center">
            Simulate a hard fall detection event to test automatic caregiver alerts & confirmation flow.
          </p>
          <button
            onClick={simulateFallDetection}
            disabled={loading}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-300 font-bold rounded-2xl border border-amber-500/30 text-base"
          >
            {loading ? 'Ingesting Fall Event...' : '⚡ Test Fall Detection Event'}
          </button>
        </div>
      )}
    </div>
  );
}
