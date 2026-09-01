/**
 * GeofenceMap.jsx — SVG-based Safe Zone Visualizer & Patient Location Map for Mobile & Web
 */

import React from 'react';
import { MapPin, Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';

export function GeofenceMap({
  safeZone = null,
  patientLocation = null,
  status = 'SAFE',
  height = '240px',
}) {
  const centerLat = safeZone?.centerLatitude || safeZone?.latitude || 28.6139;
  const centerLng = safeZone?.centerLongitude || safeZone?.longitude || 77.2090;
  const radius = safeZone?.radiusMeters || 200;

  const patientLat = patientLocation?.latitude || centerLat;
  const patientLng = patientLocation?.longitude || centerLng;
  const accuracy = patientLocation?.accuracy || 15;

  // Calculate pixel offsets relative to SVG center (300, 150)
  // Scale factor: 1 meter = 0.4 pixels
  const scale = 0.4;
  const deltaLatMeters = (patientLat - centerLat) * 111000;
  const deltaLngMeters = (patientLng - centerLng) * 111000 * Math.cos((centerLat * Math.PI) / 180);

  const patientX = 300 + deltaLngMeters * scale;
  const patientY = 150 - deltaLatMeters * scale;
  const radiusPx = radius * scale;
  const accuracyPx = accuracy * scale;

  const isOutside = status === 'OUTSIDE_ZONE';
  const isSOS = status === 'SOS_ACTIVE';

  return (
    <div className="w-full bg-[#18181B] border border-[#27272A] rounded-2xl p-4 overflow-hidden space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#D8B24C]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {safeZone?.name || 'Home Safe Zone'} ({radius}m)
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isSOS
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
              : isOutside
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}
        >
          {isSOS ? '🚨 SOS ACTIVE' : isOutside ? '🔴 OUTSIDE SAFE ZONE' : '🟢 INSIDE SAFE ZONE'}
        </span>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden bg-[#09090B] border border-[#27272A]" style={{ height }}>
        <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">
          {/* Map Grid Pattern */}
          <defs>
            <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#27272A" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="600" height="300" fill="url(#mapGrid)" />

          {/* Safe Zone Circle */}
          <circle
            cx="300"
            cy="150"
            r={Math.max(radiusPx, 20)}
            fill={isOutside ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)'}
            stroke={isOutside ? '#EF4444' : '#10B981'}
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Safe Zone Center Point */}
          <circle cx="300" cy="150" r="5" fill="#D8B24C" />
          <circle cx="300" cy="150" r="10" fill="rgba(216, 178, 76, 0.2)" />

          {/* Patient Accuracy Uncertainty Ring */}
          <circle
            cx={patientX}
            cy={patientY}
            r={Math.max(accuracyPx, 12)}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Patient Current Location Marker */}
          <circle
            cx={patientX}
            cy={patientY}
            r="7"
            fill={isSOS ? '#EF4444' : isOutside ? '#F59E0B' : '#3B82F6'}
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Connecting Line if Outside */}
          {isOutside && (
            <line
              x1="300"
              y1="150"
              x2={patientX}
              y2={patientY}
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 bg-[#18181B]/90 backdrop-blur-sm border border-[#27272A] rounded-lg px-2.5 py-1.5 flex items-center space-x-3 text-[10px] text-zinc-400">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#D8B24C]" />
            <span>Center</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span>Patient</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-500/30 border border-blue-400" />
            <span>Accuracy ({accuracy}m)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
