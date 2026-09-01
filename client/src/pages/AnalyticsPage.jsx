/**
 * AnalyticsPage.jsx — Memora Analytics & Cognitive Progress Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Clock, Gamepad2, BookOpen, Users, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import { ActivityProgressCard } from '../components/ActivityProgressCard.jsx';
import * as analyticsApi from '../api/analytics.api.js';

export function AnalyticsPage({ patientId }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [rangeDays, setRangeDays] = useState(7);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await analyticsApi.getAnalyticsOverview({ days: rangeDays, patientId });
      if (res.data) {
        setOverview(res.data);
      } else {
        setOverview(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load analytics progress statistics.');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [rangeDays, patientId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalReminders = overview?.remindersTotal ?? overview?.reminders?.total ?? 0;
  const completedReminders = overview?.remindersCompleted ?? overview?.reminders?.completed ?? 0;
  const reminderPercentage = overview?.reminderAdherenceRate ?? (
    totalReminders > 0
      ? Math.round((completedReminders / totalReminders) * 100)
      : 0
  );

  const gamesCompleted = overview?.gamesCompleted ?? overview?.games?.completed ?? 0;
  const gameAccuracy = overview?.gameAccuracy ?? overview?.games?.avgAccuracy ?? 0;
  const memoriesAdded = overview?.memoriesAdded ?? overview?.memories?.activeCount ?? 0;
  const communitySessionsAttended = overview?.communitySessionsAttended ?? overview?.community?.attendances ?? 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B24C] mb-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Cognitive & Adherence Insights</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">Analytics & Progress</h1>
          <p className="text-xs text-[#A7A7A2] mt-1">
            Track daily reminder adherence, cognitive game scores, and routine trends.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#151515] border border-[#343434] p-1 rounded-lg self-start md:self-auto">
          {[
            { days: 7, label: '7 Days' },
            { days: 30, label: '30 Days' },
            { days: 90, label: '90 Days' },
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => setRangeDays(item.days)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                rangeDays === item.days
                  ? 'bg-[#D8B24C] text-[#151515] shadow-xs'
                  : 'text-[#A7A7A2] hover:text-[#F5F5F0]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] font-medium text-sm">Computing progress statistics...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#202020] border border-[#D95C5C]/30 rounded-xl p-8 text-center shadow-xs space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Could Not Load Progress Data</h3>
            <p className="text-xs text-[#A7A7A2]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-xs rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActivityProgressCard
              title="Routine Reminders"
              value={`${reminderPercentage}%`}
              subtext={`${completedReminders} of ${totalReminders} completed`}
              icon={Clock}
              color="amber"
              percentage={reminderPercentage}
            />

            <ActivityProgressCard
              title="Cognitive Games"
              value={`${gamesCompleted} Played`}
              subtext={`${gameAccuracy}% accuracy rate`}
              icon={Gamepad2}
              color="indigo"
              percentage={gameAccuracy}
            />

            <ActivityProgressCard
              title="Memory Vault"
              value={`${memoriesAdded} Items`}
              subtext="Added to family vault"
              icon={BookOpen}
              color="emerald"
              percentage={100}
            />

            <ActivityProgressCard
              title="Community"
              value={`${communitySessionsAttended} Sessions`}
              subtext="Attended this period"
              icon={Users}
              color="purple"
              percentage={100}
            />
          </div>

          <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#F5F5F0] flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#D8B24C]" />
                <span>Cognitive Activity Performance Trend</span>
              </h3>
            </div>

            <div className="p-4 bg-[#151515] border border-[#343434] rounded-lg space-y-2">
              <p className="text-sm text-[#A7A7A2] leading-relaxed">
                Activity participation for this period: Routine completion rate is currently at{' '}
                <strong className="text-[#D8B24C]">{reminderPercentage}%</strong> with{' '}
                <strong className="text-[#F5F5F0]">{gamesCompleted} cognitive game sessions</strong> completed.
              </p>
              <p className="text-xs text-[#74746F] italic">
                * Activity trends reflect engagement levels and routine adherence based on database logs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
