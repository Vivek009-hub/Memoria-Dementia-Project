/**
 * MobileCompanionStatusCard.jsx — Safety Mobile App Connection & Status Card
 */

import React from 'react';
import { Smartphone, Wifi, WifiOff, MapPin, Activity, ShieldCheck, BatteryCharging, AlertCircle } from 'lucide-react';

export function MobileCompanionStatusCard({ isOnline = true, isConnected = true, lastHeartbeat = null }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Mobile Safety App</h3>
            <span className="text-xs text-slate-400 font-medium">Device & Background Sensors</span>
          </div>
        </div>

        {isOnline && isConnected ? (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/40 flex items-center space-x-1">
            <Wifi className="w-3.5 h-3.5" />
            <span>CONNECTED</span>
          </span>
        ) : (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/40 flex items-center space-x-1">
            <WifiOff className="w-3.5 h-3.5" />
            <span>DISCONNECTED</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-bold">
            <MapPin className="w-4 h-4" />
            <span>GPS Location</span>
          </div>
          <span className="text-slate-200 font-extrabold block">
            {isOnline ? 'Active (Accuracy 10m)' : 'Unavailable Offline'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <Activity className="w-4 h-4" />
            <span>Fall Detection</span>
          </div>
          <span className="text-slate-200 font-extrabold block">
            {isConnected ? 'Monitoring Active' : 'Sensor Off'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Background Sync</span>
          </div>
          <span className="text-slate-200 font-extrabold block">
            {lastHeartbeat ? `Updated ${new Date(lastHeartbeat).toLocaleTimeString()}` : 'Connected'}
          </span>
        </div>
      </div>
    </div>
  );
}
