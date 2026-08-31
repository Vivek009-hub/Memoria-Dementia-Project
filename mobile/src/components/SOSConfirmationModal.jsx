/**
 * SOSConfirmationModal.jsx — High-Visibility Emergency SOS Confirmation Dialog
 *
 * Prevents accidental SOS activation with a 5-second countdown and clear cancel action.
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X, CheckCircle2 } from 'lucide-react';

export function SOSConfirmationModal({ isOpen, onClose, onConfirm }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer = null;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onConfirm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div className="bg-red-950 border-2 border-red-500 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 text-center">
        {/* Animated Warning Emblem */}
        <div className="w-24 h-24 bg-red-600/30 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto text-red-400 animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h2 id="sos-modal-title" className="text-3xl font-black text-white tracking-tight">
            Send Emergency SOS Alert?
          </h2>
          <p className="text-red-200 text-sm leading-relaxed max-w-md mx-auto">
            This will immediately notify your assigned emergency contacts, caregivers, and send your current GPS coordinates.
          </p>
        </div>

        {/* Countdown Ring */}
        <div className="py-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-900/60 border border-red-500/50 text-2xl font-black text-red-300">
            {countdown}s
          </div>
          <p className="text-xs text-red-400 mt-2 font-bold uppercase tracking-wider">
            Auto-sending emergency alert
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-4 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-base rounded-2xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-4 px-4 bg-red-600 hover:bg-red-500 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center space-x-1.5 touch-target-xl"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>SEND SOS NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
}
