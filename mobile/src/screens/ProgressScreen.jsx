/**
 * ProgressScreen.jsx — Patient & Caregiver Activity & Progress Screen (Phase F14 / B14)
 *
 * Displays activity participation metrics, routine adherence, and cognitive game scores.
 * Enforces neutral non-diagnostic phrasing and accessible text alternatives.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Clock, Gamepad2, BookOpen, Users, Calendar, RefreshCw, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { ActivityProgressCard } from '../components/ActivityProgressCard.jsx';
import * as analyticsApi from '../api/analytics.api.js';

export function ProgressScreen({ patientId }) {
  const [dateRange, setDateRange] = useState('WEEK'); // 'WEEK' | 'MONTH' | 'ALL'
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProgressData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let res;
      if (patientId) {
        res = await analyticsApi.getPatientOverview(patientId);
      } else {
        res = await analyticsApi.getMeOverview();
      }
      setOverview(res.data || null);
    } catch (err) {
      setErrorMsg(err.message || 'Could not load activity progress statistics.');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Page Hero Header */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-memora-accent mb-1">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Activity Engagement</span>
          </div>
          <h1 className="text-3xl font-black text-memora-text tracking-tight">Activity & Progress</h1>
          <p className="text-sm text-memora-text-muted mt-1">
            Track daily routine completion, cognitive activity scores, and community participation.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 self-start md:self-auto w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-memora-surface-secondary border border-memora-border p-1.5 rounded-2xl space-x-1">
            {[
              { id: 'WEEK', label: '7 Days' },
              { id: 'MONTH', label: '30 Days' },
              { id: 'ALL', label: 'All Time' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  dateRange === range.id
                    ? 'bg-memora-accent text-memora-bg shadow-md'
                    : 'text-memora-text-muted hover:text-memora-text'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchProgressData}
            className="p-2.5 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text-muted hover:text-memora-text transition-colors"
            title="Refresh progress data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-memora-accent animate-spin mx-auto mb-3" />
          <p className="text-memora-text font-bold text-lg">Calculating activity progress...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-memora-surface border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-memora-text mb-1">Could Not Load Progress</h3>
            <p className="text-sm text-memora-text-muted">{errorMsg}</p>
          </div>
          <button
            onClick={fetchProgressData}
            className="px-6 py-3 bg-memora-surface-secondary hover:bg-memora-surface-hover text-memora-text font-bold text-sm rounded-2xl border border-memora-border transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Activity Summary Grid — Responsive 1-col (mobile), 2-col (tablet), 4-col (desktop) */}
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

          {/* Cognitive Activity Trend Panel */}
          <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-memora-text flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-memora-accent" />
                <span>Cognitive Activity Performance Trend</span>
              </h3>
            </div>

            <div className="p-5 bg-memora-surface-secondary border border-memora-border rounded-2xl space-y-2">
              <p className="text-sm text-memora-text leading-relaxed">
                Activity participation metrics: Routine completion rate is currently at{' '}
                <strong className="text-amber-400">{reminderPercentage}%</strong> with{' '}
                <strong className="text-memora-accent">{gamesCompleted} cognitive game sessions</strong> completed.
              </p>
              <p className="text-xs text-memora-text-subtle italic">
                * Activity trends reflect engagement levels and routine adherence based on database logs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
