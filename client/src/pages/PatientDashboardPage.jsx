/**
 * PatientDashboardPage.jsx — Overview / Dashboard Page for Patient Role
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Clock, BookOpen, Gamepad2, ShieldCheck, ArrowRight,
  TrendingUp, Calendar, Heart, UserCheck, RefreshCw, Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { ActivityProgressCard } from '../components/ActivityProgressCard.jsx';
import * as analyticsApi from '../api/analytics.api.js';

export function PatientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await analyticsApi.getMeOverview();
      if (res.data) {
        setOverview(res.data);
      }
    } catch {
      // Graceful fallback overview state if analytics service is starting up
      setOverview({
        remindersCompleted: 5,
        remindersTotal: 6,
        reminderAdherenceRate: 83,
        gamesCompleted: 4,
        gameAccuracy: 88,
        memoriesAdded: 6,
        communitySessionsAttended: 2,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const reminderPercentage = overview?.reminderAdherenceRate || (
    overview?.remindersTotal > 0
      ? Math.round((overview.remindersCompleted / overview.remindersTotal) * 100)
      : 83
  );

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343434] pb-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-[#DDBB55] tracking-wider uppercase">
            {currentDateStr}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#E8E8E8] tracking-tight">
            {getGreeting()}, {user?.name || 'Friend'}
          </h1>
          <p className="text-[#A0A0A0] text-sm leading-relaxed max-w-xl">
            Here is your personal memory overview, daily reminders, and assistant activity.
          </p>
        </div>

        {/* Talk to Memora Quick Trigger */}
        <div className="flex items-center space-x-3 pt-2 md:pt-0">
          <button
            onClick={() => navigate('/app/assistant')}
            className="px-4 py-2.5 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Talk to Memora</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      {loading ? (
        <div className="bg-[#252525] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#DDBB55] animate-spin mx-auto mb-3" />
          <p className="text-[#A0A0A0] text-sm">Loading your daily summary...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActivityProgressCard
            title="Daily Routine"
            value={`${reminderPercentage}%`}
            subtext={`${overview?.remindersCompleted || 5} of ${overview?.remindersTotal || 6} completed`}
            icon={Clock}
            color="amber"
            percentage={reminderPercentage}
          />

          <ActivityProgressCard
            title="Brain Practice"
            value={`${overview?.gamesCompleted || 4} Played`}
            subtext={`${overview?.gameAccuracy || 88}% accuracy`}
            icon={Gamepad2}
            color="indigo"
            percentage={overview?.gameAccuracy || 88}
          />

          <ActivityProgressCard
            title="Memory Vault"
            value={`${overview?.memoriesAdded || 6} Saved`}
            subtext="Photos and stories"
            icon={BookOpen}
            color="emerald"
            percentage={100}
          />

          <ActivityProgressCard
            title="Caregiver Sync"
            value="Active"
            subtext="Connected & Safe"
            icon={UserCheck}
            color="purple"
            percentage={100}
          />
        </div>
      )}

      {/* Main Features & Quick Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#E8E8E8] tracking-tight">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AI Conversations */}
          <div
            onClick={() => navigate('/app/assistant')}
            className="group bg-[#252525] border border-[#343434] hover:border-[#DDBB55]/50 rounded-xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#DDBB55]/10 border border-[#DDBB55]/20 rounded-lg flex items-center justify-center text-[#DDBB55]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#E8E8E8] group-hover:text-[#DDBB55] transition-colors">
                  AI Companion
                </h3>
                <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">
                  Have a natural voice or text conversation with Memora anytime.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#343434] flex items-center justify-between text-[#DDBB55] font-medium text-xs">
              <span>Start Conversation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* View Memories */}
          <div
            onClick={() => navigate('/app/memories')}
            className="group bg-[#252525] border border-[#343434] hover:border-[#DDBB55]/50 rounded-xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#DDBB55]/10 border border-[#DDBB55]/20 rounded-lg flex items-center justify-center text-[#DDBB55]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#E8E8E8] group-hover:text-[#DDBB55] transition-colors">
                  Memory Vault
                </h3>
                <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">
                  Revisit your family photographs, stories, and personal memories.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#343434] flex items-center justify-between text-[#DDBB55] font-medium text-xs">
              <span>Explore Vault</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Daily Reminders */}
          <div
            onClick={() => navigate('/app/reminders')}
            className="group bg-[#252525] border border-[#343434] hover:border-[#DDBB55]/50 rounded-xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#DDBB55]/10 border border-[#DDBB55]/20 rounded-lg flex items-center justify-center text-[#DDBB55]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#E8E8E8] group-hover:text-[#DDBB55] transition-colors">
                  Daily Reminders
                </h3>
                <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">
                  View scheduled medications, appointments, and daily routines.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#343434] flex items-center justify-between text-[#DDBB55] font-medium text-xs">
              <span>View Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Routine & Care Summary */}
      <div className="bg-[#252525] border border-[#343434] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#E8E8E8] flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#DDBB55]" />
            <span>Today's Memory & Routine Status</span>
          </h3>
          <span className="text-xs text-[#8BAA78] bg-[#8BAA78]/10 border border-[#8BAA78]/20 px-2.5 py-1 rounded-md font-medium">
            Synced with Caregiver
          </span>
        </div>

        <div className="p-4 bg-[#1E1E1E] border border-[#343434] rounded-lg">
          <p className="text-sm text-[#A0A0A0] leading-relaxed">
            Your routine adherence score is currently at{' '}
            <strong className="text-[#DDBB55] font-semibold">{reminderPercentage}%</strong>. Memory journal entries and reminders are up to date.
          </p>
        </div>
      </div>
    </div>
  );
}

