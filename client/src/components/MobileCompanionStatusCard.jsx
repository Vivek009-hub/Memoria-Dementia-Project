/**
 * MobileCompanionStatusCard.jsx — Safety Mobile App Connection & Status Card
 */

import React from 'react';
import { Smartphone, Wifi, WifiOff, MapPin, Activity, ShieldCheck } from 'lucide-react';

export function MobileCompanionStatusCard({ isOnline = true, isConnected = true, lastHeartbeat = null }) {
  return (
    <div className="bg-[#202020] border border-[#343434] rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#45B982]/10 text-[#45B982] rounded-lg border border-[#45B982]/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F5F5F0]">Mobile Safety App</h3>
            <span className="text-xs text-[#A7A7A2] font-medium">Device & Background Sensors</span>
          </div>
        </div>

        {isOnline && isConnected ? (
          <span className="px-2.5 py-0.5 bg-[#45B982]/10 text-[#45B982] text-xs font-semibold rounded-md border border-[#45B982]/30 flex items-center space-x-1">
            <Wifi className="w-3.5 h-3.5" />
            <span>CONNECTED</span>
          </span>
        ) : (
          <span className="px-2.5 py-0.5 bg-[#E5A83B]/10 text-[#E5A83B] text-xs font-semibold rounded-md border border-[#E5A83B]/30 flex items-center space-x-1">
            <WifiOff className="w-3.5 h-3.5" />
            <span>DISCONNECTED</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#D8B24C] font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>GPS Location</span>
          </div>
          <span className="text-[#F5F5F0] font-medium block">
            {isOnline ? 'Active (Accuracy 10m)' : 'Unavailable Offline'}
          </span>
        </div>

        <div className="p-3 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#45B982] font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Fall Detection</span>
          </div>
          <span className="text-[#F5F5F0] font-medium block">
            {isConnected ? 'Monitoring Active' : 'Sensor Off'}
          </span>
        </div>

        <div className="p-3 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#9B6B9E] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Background Sync</span>
          </div>
          <span className="text-[#F5F5F0] font-medium block">
            {lastHeartbeat ? `Updated ${new Date(lastHeartbeat).toLocaleTimeString()}` : 'Connected'}
          </span>
        </div>
      </div>
    </div>
  );
}
