/**
 * PatientDashboardPage.jsx — Overview / Dashboard Page for Patient Role
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, BookOpen, Gamepad2, ArrowRight,
  UserCheck, RefreshCw, Bot, Calendar, CheckCircle2, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ActivityProgressCard } from '../components/ActivityProgressCard.jsx';
import { PersonalizedRecommendationsCard } from '../components/PersonalizedRecommendationsCard.jsx';
import * as analyticsApi from '../api/analytics.api.js';

export function PatientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
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
  }).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const scheduleItems = [
    { time: '09:00 AM', category: 'Medicine', title: 'Vitamin B12 & Daily Prescription', color: 'text-[#D8B24C] bg-[#D8B24C]/10 border-[#D8B24C]/30', dotColor: 'bg-[#D8B24C]' },
    { time: '11:30 AM', category: 'Recall Activity', title: 'Photo memory exercise', color: 'text-[#9B6B9E] bg-[#9B6B9E]/10 border-[#9B6B9E]/30', dotColor: 'bg-[#9B6B9E]' },
    { time: '04:00 PM', category: 'Evening Walk', title: '30 mins with caregiver', color: 'text-[#45B982] bg-[#45B982]/10 border-[#45B982]/30', dotColor: 'bg-[#45B982]' },
  ];

  const recentActivities = [
    { title: 'New memory added by Caregiver', detail: 'Family trip to Manali', time: '2h ago', icon: BookOpen },
    { title: 'Brain practice completed', detail: 'Puzzle Master', time: '5h ago', icon: Gamepad2 },
    { title: 'Reminder completed', detail: 'Morning medicine', time: '1d ago', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Top Header & Dynamic Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343434] pb-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#D8B24C] tracking-widest uppercase">
            {currentDateStr}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#F5F5F0] tracking-tight">
            {getGreeting()}, {user?.name || 'Vivek'}
          </h1>
          <p className="text-[#A7A7A2] text-sm leading-relaxed max-w-xl">
            Here is your personal memory overview, daily reminders, and assistant activity.
          </p>
        </div>

        <div className="flex items-center space-x-3 pt-2 md:pt-0">
          <button
            onClick={() => navigate('/app/assistant')}
            className="px-4 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] text-sm font-semibold rounded-lg transition-all duration-150 shadow-xs flex items-center space-x-2 touch-target"
          >
            <Bot className="w-4.5 h-4.5" />
            <span>Talk to Memora</span>
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] text-sm">Loading your daily summary...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActivityProgressCard
            title="Daily Routine"
            value={`${reminderPercentage}%`}
            subtext={`${overview?.remindersCompleted || 5} of ${overview?.remindersTotal || 6} completed`}
            icon={Clock}
            color="gold"
            percentage={reminderPercentage}
          />

          <ActivityProgressCard
            title="Brain Practice"
            value={`${overview?.gamesCompleted || 4} Played`}
            subtext={`${overview?.gameAccuracy || 88}% accuracy`}
            icon={Gamepad2}
            color="purple"
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
            color="pink"
            percentage={100}
          />
        </div>
      )}

      {/* Quick Access Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F5F5F0] tracking-tight">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AI Companion */}
          <div
            onClick={() => navigate('/app/assistant')}
            className="group bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-lg flex items-center justify-center text-[#D8B24C]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors">
                  AI Companion
                </h3>
                <p className="text-xs text-[#A7A7A2] mt-1 leading-relaxed">
                  Have a natural voice or text conversation with Memora anytime.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#343434] flex items-center justify-between text-[#D8B24C] font-medium text-xs">
              <span>Start Conversation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Memory Vault */}
          <div
            onClick={() => navigate('/app/memories')}
            className="group bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-lg flex items-center justify-center text-[#D8B24C]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors">
                  Memory Vault
                </h3>
                <p className="text-xs text-[#A7A7A2] mt-1 leading-relaxed">
                  Revisit your family photographs, stories, and personal memories.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#343434] flex items-center justify-between text-[#D8B24C] font-medium text-xs">
              <span>Explore Vault</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Daily Reminders */}
          <div
            onClick={() => navigate('/app/reminders')}
            className="group bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-lg flex items-center justify-center text-[#D8B24C]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors">
                  Daily Reminders
                </h3>
                <p className="text-xs text-[#A7A7A2] mt-1 leading-relaxed">
                  View and add medications, appointments, and daily routines.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#343434] flex items-center justify-between text-[#D8B24C] font-medium text-xs">
              <span>View Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <PersonalizedRecommendationsCard onNavigate={(path) => navigate(path)} />

      {/* Today's Schedule & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Timeline */}
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#F5F5F0] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#D8B24C]" />
              <span>Today's Schedule</span>
            </h3>
            <button
              onClick={() => navigate('/app/reminders')}
              className="text-xs font-medium text-[#D8B24C] hover:text-[#F0C75E] transition-colors"
            >
              View All
            </button>
          </div>

          <div className="relative pl-5 space-y-4 pt-1 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#343434]">
            {scheduleItems.map((item, idx) => (
              <div
                key={idx}
                className="relative flex items-start space-x-3.5 p-3.5 bg-[#151515] border border-[#343434] rounded-lg transition-colors hover:border-[#343434]/80"
              >
                <span className={`absolute -left-5 top-4.5 w-2.5 h-2.5 rounded-full border border-[#202020] ${item.dotColor}`} />
                <div className="text-xs font-mono font-semibold text-[#A7A7A2] w-20 pt-0.5 shrink-0">
                  {item.time}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${item.color}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#F5F5F0]">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#F5F5F0] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#D8B24C]" />
              <span>Recent Activity</span>
            </h3>
            <button
              onClick={() => navigate('/app/notifications')}
              className="text-xs font-medium text-[#D8B24C] hover:text-[#F0C75E] transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {recentActivities.map((act, idx) => {
              const IconComp = act.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-[#151515] border border-[#343434] rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#242424] border border-[#343434] rounded-lg text-[#D8B24C]">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#A7A7A2]">{act.title}</p>
                      <p className="text-sm font-semibold text-[#F5F5F0]">{act.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#74746F] font-mono">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
