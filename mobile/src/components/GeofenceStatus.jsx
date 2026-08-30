/**
 * GeofenceStatus.jsx — Geofence safe zone monitoring status component
 */

import React from 'react';
import { MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';

export function GeofenceStatus({ geofences = [] }) {
  const activeGeofences = geofences.filter((gf) => gf.isActive);
  const breachedGf = activeGeofences.find((gf) => gf.currentState === 'OUTSIDE');

  return (
    <div className="w-full max-w-md p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg">
      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="w-6 h-6 text-sky-400" />
        <h3 className="text-xl font-bold text-slate-100">Geofence Safe Zone</h3>
      </div>

      {breachedGf ? (
        <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-2xl flex items-center space-x-3">
          <ShieldAlert className="w-10 h-10 text-red-400 flex-shrink-0" />
          <div>
            <span className="text-sm font-black text-red-300 tracking-wider uppercase block">OUTSIDE SAFE ZONE</span>
            <span className="text-base font-bold text-white">{breachedGf.name}</span>
            <p className="text-xs text-red-200 mt-0.5">Caregivers have been notified of boundary exit.</p>
          </div>
        </div>
      ) : activeGeofences.length > 0 ? (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-center space-x-3">
          <ShieldCheck className="w-10 h-10 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider block">INSIDE SAFE ZONE</span>
            <span className="text-base font-semibold text-slate-100">{activeGeofences[0].name}</span>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Radius: {activeGeofences[0].radiusMeters}m safe boundary
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-center">
          <p className="text-sm font-medium text-slate-300">No active safe zones configured by caregiver.</p>
        </div>
      )}
    </div>
  );
}
