import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, BookOpen, Gamepad2, ArrowRight,
  UserCheck, RefreshCw, Bot, Calendar, CheckCircle2, Activity, AlertTriangle, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { ActivityProgressCard } from '../components/ActivityProgressCard.jsx';
import { PersonalizedRecommendationsCard } from '../components/PersonalizedRecommendationsCard.jsx';
import * as analyticsApi from '../api/analytics.api.js';
import * as remindersApi from '../api/reminders.api.js';
import * as notificationsApi from '../api/notifications.api.js';

export function PatientDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.notifications)) return res.data.notifications;
    if (Array.isArray(res.notifications)) return res.notifications;
    if (Array.isArray(res.data?.reminders)) return res.data.reminders;
    if (Array.isArray(res.reminders)) return res.reminders;
    if (Array.isArray(res.items)) return res.items;
    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [overviewRes, remindersRes, notifsRes] = await Promise.all([
        analyticsApi.getMeOverview().catch(() => null),
        remindersApi.getReminders().catch(() => null),
        notificationsApi.getNotifications({ limit: 5 }).catch(() => null),
      ]);

      const overviewData = overviewRes?.data || overviewRes;
      if (overviewData) {
        setOverview(overviewData);
      }

      const remindersArray = extractArray(remindersRes);
      setScheduleItems(remindersArray);

      const notifItems = extractArray(notifsRes).map((n) => ({
        id: n._id || n.id,
        title: n.title || 'Notification',
        detail: n.message || n.body || n.type || '',
        category: n.type ? n.type.replace(/_/g, ' ') : 'NOTIFICATION',
        timestamp: n.createdAt || n.timestamp || new Date(),
        icon: Bell,
      }));

      const activityItems = extractArray(overviewData?.recentActivity).map((a) => ({
        id: a._id || a.id,
        title: a.metadata?.title || a.metadata?.detail || (a.eventType ? a.eventType.replace(/_/g, ' ') : 'System Event'),
        detail: a.metadata?.description || a.source || 'Activity Logged',
        category: a.source || (a.eventType ? a.eventType.replace(/_/g, ' ') : 'ACTIVITY'),
        timestamp: a.timestamp || a.createdAt || new Date(),
        icon: Activity,
      }));

      const combined = [...notifItems, ...activityItems].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivities(combined);
    } catch (err) {
      setErrorMsg(err.message || 'Could not load dashboard information from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalReminders = overview?.remindersTotal ?? overview?.reminders?.total ?? 0;
  const completedReminders = overview?.remindersCompleted ?? overview?.reminders?.completed ?? 0;
  const reminderPercentage = overview?.reminderAdherenceRate ?? (
    totalReminders > 0
      ? Math.round((completedReminders / totalReminders) * 100)
      : 0
  );

  const gamesPlayed = overview?.gamesCompleted ?? overview?.games?.completed ?? 0;
  const gameAccuracy = overview?.gameAccuracy ?? overview?.games?.avgAccuracy ?? 0;
  const memoriesCount = overview?.memoriesAdded ?? overview?.memories?.activeCount ?? 0;

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.good_morning', 'Good morning');
    if (hour < 18) return t('dashboard.good_afternoon', 'Good afternoon');
    return t('dashboard.good_evening', 'Good evening');
  };

  const formatScheduleTime = (item) => {
    if (!item) return '--:--';

    let rawTime = item?.schedule?.time || item?.time || item?.scheduledTime;

    if (!rawTime) {
      const dateVal = item?.schedule?.startAt || item?.scheduledAt || item?.createdAt || item?.date;
      if (dateVal) {
        const dateObj = new Date(dateVal);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
      }
    }

    if (!rawTime || typeof rawTime !== 'string') return '--:--';

    try {
      const parts = rawTime.split(':');
      const h = parseInt(parts[0], 10);
      const m = parts[1] || '00';
      if (isNaN(h)) return rawTime;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12;
      return `${formattedHour.toString().padStart(2, '0')}:${m} ${ampm}`;
    } catch {
      return rawTime;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Top Header & Dynamic Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343434] pb-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#D8B24C] tracking-widest uppercase">
            {currentDateStr}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#F5F5F0] tracking-tight">
            {getGreeting()}, {user?.name || t('dashboard.patient', 'Patient')}
          </h1>
          <p className="text-[#A7A7A2] text-sm leading-relaxed max-w-xl">
            {t('dashboard.patient_subtitle', 'Here is your personal memory overview, daily reminders, and assistant activity.')}
          </p>
        </div>

        <div className="flex items-center space-x-3 pt-2 md:pt-0">
          <button
            onClick={() => navigate('/app/assistant')}
            className="px-4 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] text-sm font-semibold rounded-lg transition-all duration-150 shadow-xs flex items-center space-x-2 touch-target"
          >
            <Bot className="w-4.5 h-4.5" />
            <span>{t('dashboard.talk_to_memora', 'Talk to Memora')}</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-[#202020] hover:bg-[#2A2A2A] border border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dashboard Statistics / Error / Loading */}
      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] text-sm font-medium">{t('common.loading', 'Loading...')}</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#202020] border border-[#D95C5C]/30 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Could Not Load Overview</h3>
            <p className="text-xs text-[#A7A7A2]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-xs rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('common.retry', 'Try Again')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActivityProgressCard
            title={t('dashboard.daily_routine', 'Daily Routine')}
            value={`${reminderPercentage}%`}
            subtext={`${completedReminders} of ${totalReminders} ${t('common.done', 'completed')}`}
            icon={Clock}
            color="gold"
            percentage={reminderPercentage}
          />

          <ActivityProgressCard
            title={t('dashboard.cognitive_games', 'Brain Practice')}
            value={`${gamesPlayed} ${t('dashboard.games_played', 'Played')}`}
            subtext={`${gameAccuracy}% accuracy`}
            icon={Gamepad2}
            color="purple"
            percentage={gameAccuracy}
          />

          <ActivityProgressCard
            title={t('dashboard.memory_vault', 'Memory Vault')}
            value={`${memoriesCount} ${t('dashboard.memories_saved', 'Saved')}`}
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

          {scheduleItems.length === 0 ? (
            <div className="p-8 text-center bg-[#151515] border border-[#343434] rounded-lg text-[#74746F] space-y-2">
              <Clock className="w-8 h-8 mx-auto text-[#555550]" />
              <p className="text-xs font-medium text-[#A7A7A2]">No reminders scheduled for today</p>
            </div>
          ) : (
            <div className="relative pl-5 space-y-4 pt-1 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#343434]">
              {scheduleItems.slice(0, 5).map((item) => (
                <div
                  key={item._id || item.id}
                  className="relative flex items-start space-x-3.5 p-3.5 bg-[#151515] border border-[#343434] rounded-lg transition-colors hover:border-[#343434]/80"
                >
                  <span className="absolute -left-5 top-4.5 w-2.5 h-2.5 rounded-full border border-[#202020] bg-[#D8B24C]" />
                  <div className="text-xs font-mono font-semibold text-[#A7A7A2] w-20 pt-0.5 shrink-0">
                    {formatScheduleTime(item)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold border text-[#D8B24C] bg-[#D8B24C]/10 border-[#D8B24C]/30 uppercase">
                        {item.type || item.category || 'REMINDER'}
                      </span>
                      {item.status === 'COMPLETED' && (
                        <span className="text-[10px] text-[#45B982] font-semibold">✓ Completed</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#F5F5F0]">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

          {recentActivities.length === 0 ? (
            <div className="p-8 text-center bg-[#151515] border border-[#343434] rounded-lg text-[#74746F] space-y-2">
              <Bell className="w-8 h-8 mx-auto text-[#555550]" />
              <p className="text-xs font-medium text-[#A7A7A2]">No recent activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {recentActivities.slice(0, 5).map((act, idx) => {
                const IconComp = act.icon || Activity;
                return (
                  <div
                    key={act.id || idx}
                    className="flex items-center justify-between p-3.5 bg-[#151515] border border-[#343434] rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#242424] border border-[#343434] rounded-lg text-[#D8B24C]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#D8B24C] uppercase tracking-wider">
                          {act.category}
                        </p>
                        <p className="text-sm font-semibold text-[#F5F5F0]">{act.title}</p>
                        {act.detail && act.detail !== act.title && (
                          <p className="text-xs text-[#A7A7A2]">{act.detail}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#74746F] font-mono shrink-0 ml-2">
                      {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
