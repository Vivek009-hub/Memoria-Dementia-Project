/**
 * CaregiverPatientOverviewCard.jsx — Caregiver Patient Activity Overview Card
 */

import React from 'react';
import { Clock, Gamepad2, BookOpen, Users, Shield, MapPin, Activity } from 'lucide-react';

export function CaregiverPatientOverviewCard({
  overview,
  patientName = overview?.patientName || overview?.patient?.name || 'Patient',
  remindersCount = overview?.remindersTotal || overview?.remindersCount || 0,
  remindersCompleted = overview?.remindersCompleted || 0,
  memoriesCount = overview?.memoriesAdded || overview?.memoriesCount || 0,
  safetyStatus = overview?.safetyStatus || 'CONNECTED',
  locationAccuracy = overview?.locationAccuracy || 10,
  activeSOS = overview?.activeSOS || null,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
            Authorized Support Overview
          </span>
          <h3 className="text-2xl font-black text-white">{patientName}</h3>
        </div>

        {activeSOS ? (
          <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-black rounded-full border border-red-500/40 flex items-center space-x-1 animate-pulse">
            <Shield className="w-4 h-4" />
            <span>🚨 SOS ACTIVE</span>
          </span>
        ) : (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/40 flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>{safetyStatus}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-amber-400 font-bold">
            <Clock className="w-4 h-4" />
            <span>Daily Routine</span>
          </div>
          <span className="text-lg font-black text-white block">
            {remindersCompleted} / {remindersCount} Done
          </span>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-indigo-400 font-bold">
            <BookOpen className="w-4 h-4" />
            <span>Memory Vault</span>
          </div>
          <span className="text-lg font-black text-white block">
            {memoriesCount} Items
          </span>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-emerald-400 font-bold">
            <Activity className="w-4 h-4" />
            <span>Participation</span>
          </div>
          <span className="text-lg font-black text-white block">
            Active Today
          </span>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-teal-400 font-bold">
            <MapPin className="w-4 h-4" />
            <span>GPS Tracking</span>
          </div>
          <span className="text-lg font-black text-white block">
            {safetyStatus === 'CONNECTED' ? `GPS (${locationAccuracy}m)` : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
