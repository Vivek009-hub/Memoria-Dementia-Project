/**
 * MobileCompanionStatusCard.jsx — Safety Mobile App Connection & Status Card
 */

import React from 'react';
import { Smartphone, Wifi, WifiOff, MapPin, Activity, ShieldCheck } from 'lucide-react';

export function MobileCompanionStatusCard({ isOnline = true, isConnected = true, lastHeartbeat = null }) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300 font-bold">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Mobile Safety Companion</h3>
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Device & Background Sensors</span>
          </div>
        </div>

        {isOnline && isConnected ? (
          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl border border-emerald-300 flex items-center space-x-1.5 shadow-sm">
            <Wifi className="w-4 h-4" />
            <span>CONNECTED</span>
          </span>
        ) : (
          <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 text-xs font-black rounded-xl border border-amber-300 flex items-center space-x-1.5 shadow-sm">
            <WifiOff className="w-4 h-4" />
            <span>DISCONNECTED</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center space-x-1.5 text-blue-700 font-black">
            <MapPin className="w-4 h-4" />
            <span>GPS Location</span>
          </div>
          <span className="text-slate-900 font-bold block text-sm">
            {isOnline ? 'Active (Accuracy 10m)' : 'Unavailable Offline'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-700 font-black">
            <Activity className="w-4 h-4" />
            <span>Fall Detection</span>
          </div>
          <span className="text-slate-900 font-bold block text-sm">
            {isConnected ? 'Monitoring Active' : 'Sensor Off'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center space-x-1.5 text-purple-700 font-black">
            <ShieldCheck className="w-4 h-4" />
            <span>Background Sync</span>
          </div>
          <span className="text-slate-900 font-bold block text-sm">
            {lastHeartbeat ? `Updated ${new Date(lastHeartbeat).toLocaleTimeString()}` : 'Connected'}
          </span>
        </div>
      </div>
    </div>
  );
}
