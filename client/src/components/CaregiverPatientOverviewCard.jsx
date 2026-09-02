/**
 * CaregiverPatientOverviewCard.jsx — Caregiver Patient Activity Overview Card
 */

import React from 'react';
import { Clock, BookOpen, Shield, MapPin, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

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
  const { t } = useLanguage();

  const displayPatientName = patientName === 'Patient' ? t('dashboard.patient', 'Patient') : patientName;

  return (
    <div className="bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-6 shadow-xs space-y-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#343434] pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D8B24C] block">
            {t('dashboard.authorized_overview', 'Authorized Support Overview')}
          </span>
          <h3 className="text-xl font-bold text-[#F5F5F0]">{displayPatientName}</h3>
        </div>

        {activeSOS ? (
          <span className="px-3 py-1 bg-[#D95C5C]/10 text-[#D95C5C] text-xs font-semibold rounded-md border border-[#D95C5C]/30 flex items-center space-x-1 animate-pulse">
            <Shield className="w-4 h-4" />
            <span>🚨 {t('dashboard.sos_active', 'SOS ACTIVE')}</span>
          </span>
        ) : (
          <span className="px-3 py-1 bg-[#45B982]/10 text-[#45B982] text-xs font-semibold rounded-md border border-[#45B982]/30 flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>{safetyStatus === 'CONNECTED' ? t('dashboard.connected', 'CONNECTED') : safetyStatus}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#D8B24C] font-semibold">
            <Clock className="w-4 h-4" />
            <span>{t('dashboard.daily_routine', 'Daily Routine')}</span>
          </div>
          <span className="text-base font-bold text-[#F5F5F0] block">
            {remindersCompleted} / {remindersCount} {t('common.done', 'Done')}
          </span>
        </div>

        <div className="p-3.5 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#D8B24C] font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>{t('dashboard.memory_vault', 'Memory Vault')}</span>
          </div>
          <span className="text-base font-bold text-[#F5F5F0] block">
            {memoriesCount} {t('common.items', 'Items')}
          </span>
        </div>

        <div className="p-3.5 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#45B982] font-semibold">
            <Activity className="w-4 h-4" />
            <span>{t('dashboard.participation', 'Participation')}</span>
          </div>
          <span className="text-base font-bold text-[#F5F5F0] block">
            {t('dashboard.active_today', 'Active Today')}
          </span>
        </div>

        <div className="p-3.5 bg-[#151515] rounded-lg border border-[#343434] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#45B982] font-semibold">
            <MapPin className="w-4 h-4" />
            <span>{t('dashboard.gps_tracking', 'GPS Tracking')}</span>
          </div>
          <span className="text-base font-bold text-[#F5F5F0] block">
            {safetyStatus === 'CONNECTED' ? `GPS (${locationAccuracy}m)` : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
