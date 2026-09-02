/**
 * MobileCompanionStatusCard.jsx — Safety Mobile App Connection & Status Card
 */

import React from 'react';
import { Smartphone, Wifi, WifiOff, MapPin, Activity, ShieldCheck, BatteryCharging, AlertCircle } from 'lucide-react';

export function MobileCompanionStatusCard({ isOnline, isConnected = true, lastHeartbeat = null }) {
  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-6 shadow-lg space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#10B981]/10 text-[#10B981] rounded-2xl border border-[#10B981]/30 font-bold">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#F8FAFC]">Mobile Safety Companion</h3>
            <span className="text-xs text-[#94A3B8] font-extrabold uppercase tracking-wider">Device & Background Sensors</span>
          </div>
        </div>

        {isOnline && isConnected ? (
          <span className="px-3.5 py-1.5 bg-[#10B981]/10 text-[#10B981] text-xs font-black rounded-xl border border-[#10B981]/30 flex items-center space-x-1.5 shadow-sm">
            <Wifi className="w-4 h-4" />
            <span>CONNECTED</span>
          </span>
        ) : (
          <span className="px-3.5 py-1.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-black rounded-xl border border-[#F59E0B]/30 flex items-center space-x-1.5 shadow-sm">
            <WifiOff className="w-4 h-4" />
            <span>DISCONNECTED</span>
          </span>
        )}
      </div>

      {/* Sensor Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
        <div className="p-4 bg-[#202020] rounded-2xl border border-[#2A2A2A] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#F4C542] font-black">
            <MapPin className="w-4 h-4" />
            <span>GPS Location</span>
          </div>
          <span className="text-[#F8FAFC] font-bold block text-sm">
            {isOnline ? 'Active (Accuracy 10m)' : 'Unavailable Offline'}
          </span>
        </div>

        <div className="p-4 bg-[#202020] rounded-2xl border border-[#2A2A2A] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#10B981] font-black">
            <Activity className="w-4 h-4" />
            <span>Fall Detection</span>
          </div>
          <span className="text-[#F8FAFC] font-bold block text-sm">
            {isConnected ? 'Monitoring Active' : 'Sensor Off'}
          </span>
        </div>

        <div className="p-4 bg-[#202020] rounded-2xl border border-[#2A2A2A] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#60A5FA] font-black">
            <ShieldCheck className="w-4 h-4" />
            <span>Background Sync</span>
          </div>
          <span className="text-[#F8FAFC] font-bold block text-sm">
            {lastHeartbeat ? `Updated ${new Date(lastHeartbeat).toLocaleTimeString()}` : 'Connected'}
          </span>
        </div>
      </div>
    </div>
  );
}
