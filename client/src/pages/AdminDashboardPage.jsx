/**
 * AdminDashboardPage.jsx — Memora Simplified Admin Control Dashboard
 *
 * Implements 6 core administration areas:
 * 1. Overview (Real DB metrics)
 * 2. Community Events (Create, Edit, Schedule, Cancel)
 * 3. Community Voting (Proposals, Open/Close voting, Results, Select & Schedule)
 * 4. User Management (List, Search, Role Filter, Role Change, Status Suspend/Activate, Last-Admin Protection)
 * 5. Activity Log (Audit log of admin & system actions)
 * 6. Basic Traffic (Requests count, Active users, Error count, Latency, Time Range selector, Traffic chart)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Calendar,
  ThumbsUp,
  Users,
  RefreshCw,
  AlertTriangle,
  Activity,
  BarChart2,
  Search,
  UserCheck,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Globe,
} from 'lucide-react';
import { AdminCommunityProposalModal } from '../components/AdminCommunityProposalModal.jsx';
import { AdminScheduleSessionModal } from '../components/AdminScheduleSessionModal.jsx';
import { AdminUserEditModal } from '../components/AdminUserEditModal.jsx';
import * as adminApi from '../api/admin.api.js';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  // Tabs: 'OVERVIEW' | 'EVENTS' | 'VOTING' | 'USERS' | 'ACTIVITY' | 'TRAFFIC'

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Overview State
  const [overview, setOverview] = useState(null);

  // 2. Events & Voting State
  const [eventsFilter, setEventsFilter] = useState('ALL');
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [proposals, setProposals] = useState([]);

  // 3. User Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ total: 0, totalPages: 1 });

  // 4. Activity Log State
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState({ total: 0, totalPages: 1 });

  // 5. Basic Traffic State
  const [trafficRange, setTrafficRange] = useState('today');
  const [trafficData, setTrafficData] = useState(null);

  // Modals
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedProposalForSchedule, setSelectedProposalForSchedule] = useState(null);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  // Data fetching router
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'OVERVIEW') {
        const res = await adminApi.getAdminOverview();
        setOverview(res.data);
      } else if (activeTab === 'EVENTS') {
        const res = await adminApi.getAdminScheduledSessions();
        setScheduledSessions(res.data || []);
      } else if (activeTab === 'VOTING') {
        const res = await adminApi.getAdminProposals();
        setProposals(res.data || []);
      } else if (activeTab === 'USERS') {
        const res = await adminApi.getAdminUsers({
          q: userSearch,
          role: userRoleFilter,
          page: userPage,
          limit: 10,
        });
        setUsers(res.data || []);
        if (res.pagination) setUserPagination(res.pagination);
      } else if (activeTab === 'ACTIVITY') {
        const res = await adminApi.getAdminActivity({ page: activityPage, limit: 15 });
        setActivityLogs(res.data || []);
        if (res.pagination) setActivityPagination(res.pagination);
      } else if (activeTab === 'TRAFFIC') {
        const res = await adminApi.getAdminTraffic({ range: trafficRange });
        setTrafficData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load admin console data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, userSearch, userRoleFilter, userPage, activityPage, trafficRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleCreateProposal = async (formData) => {
    await adminApi.createProposal(formData);
    fetchData();
  };

  const handleScheduleSession = async (formData) => {
    await adminApi.publishScheduledSession(formData);
    fetchData();
  };

  const handleToggleVoting = async (ideaId, currentStatus) => {
    const isOpen = currentStatus !== 'VOTING';
    await adminApi.toggleProposalVoting(ideaId, isOpen);
    fetchData();
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled community session?')) {
      return;
    }
    await adminApi.cancelSession(sessionId);
    fetchData();
  };

  const handleSaveUser = async ({ userId, role, isActive }) => {
    await adminApi.updateUserRole(userId, role);
    await adminApi.updateUserStatus(userId, isActive);
    fetchData();
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = !user.isActive;
    try {
      await adminApi.updateUserStatus(user.id || user._id, newStatus);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">
              System Administration
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage community events, voting options, system users, activity logs, and basic operational traffic metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setProposalModalOpen(true)}
            className="px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-4 h-4" />
            <span>New Voting Idea</span>
          </button>

          <button
            onClick={() => {
              setSelectedProposalForSchedule(null);
              setScheduleModalOpen(true);
            }}
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-xl flex items-center overflow-x-auto gap-1">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: BarChart2 },
          { id: 'EVENTS', label: 'Community Events', icon: Calendar },
          { id: 'VOTING', label: 'Community Voting', icon: ThumbsUp },
          { id: 'USERS', label: 'User Management', icon: Users },
          { id: 'ACTIVITY', label: 'Activity Log', icon: Activity },
          { id: 'TRAFFIC', label: 'Basic Traffic', icon: Globe },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-[130px] py-3.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-950/80 border border-red-500/40 rounded-3xl p-4 sm:p-6 text-red-200 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center shadow-xl space-y-3">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-slate-300 font-bold text-lg">Loading Administrative Data...</p>
        </div>
      ) : activeTab === 'OVERVIEW' ? (
        /* ── 1. OVERVIEW TAB ── */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Total Registered Users"
              value={overview?.totalUsers || 0}
              label="All system roles"
              icon={Users}
              color="text-cyan-400"
            />
            <StatCard
              title="Patient Accounts"
              value={overview?.patients || 0}
              label="Active patients"
              icon={UserCheck}
              color="text-emerald-400"
            />
            <StatCard
              title="Caregiver Accounts"
              value={overview?.caregivers || 0}
              label="Caregivers & Guardians"
              icon={ShieldCheck}
              color="text-indigo-400"
            />
            <StatCard
              title="Session Hosts / Teachers"
              value={overview?.hosts || 0}
              label="Community session hosts"
              icon={Globe}
              color="text-amber-400"
            />
            <StatCard
              title="Upcoming Events"
              value={overview?.upcomingEvents || 0}
              label="Scheduled community sessions"
              icon={Calendar}
              color="text-purple-400"
            />
            <StatCard
              title="Active Users (24h)"
              value={overview?.activeUsers || 0}
              label="Logged in past 24 hours"
              icon={Activity}
              color="text-rose-400"
            />
          </div>
        </div>
      ) : activeTab === 'EVENTS' ? (
        /* ── 2. COMMUNITY EVENTS TAB ── */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-black text-white">Community Event Sessions</h2>
            </div>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>

          {scheduledSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Scheduled Community Events"
              message="Click '+ New Event' to schedule a virtual gathering for patients."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {scheduledSessions.map((sess) => (
                <div
                  key={sess._id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold rounded-xl uppercase">
                        {sess.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {sess.registeredCount || 0} / {sess.maximumParticipants || '∞'} Reg
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">{sess.title}</h3>
                    {sess.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{sess.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(sess.date).toLocaleDateString()}</span>
                    </div>

                    {sess.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelSession(sess._id)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-300 font-extrabold text-[11px] rounded-xl transition-colors"
                      >
                        Cancel Event
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'VOTING' ? (
        /* ── 3. COMMUNITY VOTING TAB ── */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black text-white">Community Voting Proposals</h2>
            </div>
            <button
              onClick={() => setProposalModalOpen(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Voting Option</span>
            </button>
          </div>

          {proposals.length === 0 ? (
            <EmptyState
              icon={ThumbsUp}
              title="No Voting Ideas Available"
              message="Create voting options to allow patients to choose upcoming community topics."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {proposals.map((prop) => {
                const isOpen = prop.status === 'VOTING';
                return (
                  <div
                    key={prop._id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold rounded-xl uppercase">
                          {prop.category || 'COMMUNITY'}
                        </span>
                        <span className="text-xs font-black text-amber-400">
                          {prop.voteCount || 0} Votes
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">{prop.title}</h3>
                      {prop.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{prop.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleToggleVoting(prop._id, prop.status)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-extrabold flex items-center space-x-1.5 ${
                            isOpen
                              ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {isOpen ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                          <span>{isOpen ? 'Voting Open' : 'Voting Closed'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProposalForSchedule(prop);
                            setScheduleModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-xl shadow-md"
                        >
                          Select & Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'USERS' ? (
        /* ── 4. USER MANAGEMENT TAB ── */
        <div className="space-y-6">
          {/* Controls Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-300 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="PATIENT">Patient</option>
                <option value="CAREGIVER">Caregiver</option>
                <option value="HOST">Host / Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                        No user accounts match search filter.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div>{u.name}</div>
                          <div className="text-[11px] font-medium text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${
                              u.role === 'ADMIN'
                                ? 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                                : u.role === 'CAREGIVER'
                                ? 'bg-indigo-950 border-indigo-500/40 text-indigo-300'
                                : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center space-x-1 border ${
                              u.isActive
                                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-950/60 border-red-500/30 text-red-400'
                            }`}
                          >
                            {u.isActive ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                          </button>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserForEdit(u);
                              setEditUserModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                          >
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>
                Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} Total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={userPage <= 1}
                  onClick={() => setUserPage(userPage - 1)}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={userPage >= userPagination.totalPages}
                  onClick={() => setUserPage(userPage + 1)}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'ACTIVITY' ? (
        /* ── 5. ACTIVITY LOG TAB ── */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-black text-white">System Activity & Audit Logs</h2>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-sans font-bold">
                        No activity records found.
                      </td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="p-4 text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-white font-sans">
                          {log.actor} ({log.actorRole})
                        </td>
                        <td className="p-4 text-cyan-400 font-bold">{log.action}</td>
                        <td className="p-4 text-slate-400">{log.category}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>
                Page {activityPagination.page} of {activityPagination.totalPages} ({activityPagination.total} Total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={activityPage <= 1}
                  onClick={() => setActivityPage(activityPage - 1)}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={activityPage >= activityPagination.totalPages}
                  onClick={() => setActivityPage(activityPage + 1)}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── 6. BASIC TRAFFIC MONITORING TAB ── */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white">Basic Operational Traffic</h2>
            </div>

            <div className="flex items-center space-x-2">
              {['today', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTrafficRange(r)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all uppercase ${
                    trafficRange === r
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="API Requests"
              value={trafficData?.totalRequests || 0}
              label={`Requests (${trafficRange})`}
              icon={Globe}
              color="text-emerald-400"
            />
            <StatCard
              title="Active Users"
              value={trafficData?.activeUsers || 0}
              label="Unique user requests"
              icon={Users}
              color="text-cyan-400"
            />
            <StatCard
              title="Total Errors (4xx/5xx)"
              value={trafficData?.totalErrors || 0}
              label={`${trafficData?.errors4xx || 0} 4xx • ${trafficData?.errors5xx || 0} 5xx`}
              icon={AlertTriangle}
              color="text-rose-400"
            />
            <StatCard
              title="Avg Response Latency"
              value={`${trafficData?.avgResponseTimeMs || 0} ms`}
              label="Server execution time"
              icon={Clock}
              color="text-amber-400"
            />
          </div>

          {/* Simple Visual Traffic Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <span>Traffic Trend Activity</span>
            </h3>

            {trafficData?.chartData && trafficData.chartData.length > 0 ? (
              <div className="h-48 flex items-end space-x-2 pt-6 border-b border-slate-800 pb-2">
                {trafficData.chartData.map((pt, idx) => {
                  const maxVal = Math.max(...trafficData.chartData.map((p) => p.requests)) || 1;
                  const heightPct = Math.max(10, Math.round((pt.requests / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg group-hover:brightness-125 transition-all"
                      />
                      <span className="text-[9px] text-slate-500 font-mono mt-2 truncate w-full text-center">
                        {pt.label.split(' ')[1] || pt.label.slice(-5)}
                      </span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] font-bold text-white rounded-xl shadow-xl z-20 whitespace-nowrap">
                        {pt.label}: {pt.requests} requests ({pt.errors} errors)
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">
                No traffic logged for this time range yet. Operational API requests will automatically appear here.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminCommunityProposalModal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        onCreateProposal={handleCreateProposal}
      />

      <AdminScheduleSessionModal
        proposal={selectedProposalForSchedule}
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedProposalForSchedule(null);
        }}
        onScheduleSession={handleScheduleSession}
      />

      <AdminUserEditModal
        user={selectedUserForEdit}
        isOpen={editUserModalOpen}
        onClose={() => {
          setEditUserModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        onSaveSuccess={handleSaveUser}
      />
    </div>
  );
}

/**
 * Reusable Stat Card Component matching Memora slate-900 card styling
 */
function StatCard({ title, value, label, icon: Icon, color = 'text-cyan-400' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      <span className="text-[11px] text-slate-500 font-medium block">{label}</span>
    </div>
  );
}

/**
 * Reusable Empty State Container
 */
function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center shadow-xl space-y-3">
      <Icon className="w-12 h-12 text-slate-600 mx-auto" />
      <h3 className="text-lg font-extrabold text-white">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">{message}</p>
    </div>
  );
}
