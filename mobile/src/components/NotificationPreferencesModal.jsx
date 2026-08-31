/**
 * NotificationPreferencesModal.jsx — Notification Preferences Settings Modal
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Mail, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import * as notificationsApi from '../api/notifications.api.js';

export function NotificationPreferencesModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Preference channels
  const [inApp, setInApp] = useState(true);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);

  // Preference categories
  const [reminders, setReminders] = useState(true);
  const [community, setCommunity] = useState(true);
  const [meetings, setMeetings] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPrefs();
    }
  }, [isOpen]);

  const fetchPrefs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await notificationsApi.getNotificationPreferences();
      if (res.data) {
        const p = res.data;
        if (p.channels) {
          setInApp(p.channels.inApp !== false);
          setPush(p.channels.push !== false);
          setEmail(p.channels.email !== false);
          setSms(p.channels.sms !== false);
        }
        if (p.categories) {
          setReminders(p.categories.REMINDER !== false);
          setCommunity(p.categories.COMMUNITY_SESSION !== false);
          setMeetings(p.categories.MEETING !== false);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to load notification preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      channels: { inApp, push, email, sms },
      categories: {
        REMINDER: reminders,
        COMMUNITY_SESSION: community,
        MEETING: meetings,
      },
    };

    try {
      await notificationsApi.updateNotificationPreferences(payload);
      setSuccessMsg('Notification preferences updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pref-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Bell className="w-6 h-6" />
            <h2 id="pref-modal-title" className="text-xl font-extrabold text-white">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-8 h-8 animate-bounce mx-auto mb-2 text-indigo-400" />
            <p className="font-bold">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold">
                {successMsg}
              </div>
            )}

            {/* Notification Channels */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Delivery Channels
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">In-App Notifications</span>
                      <span className="text-xs text-slate-400 block">Show alerts inside Memora</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={inApp}
                    onChange={(e) => setInApp(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">Mobile Push Notifications</span>
                      <span className="text-xs text-slate-400 block">Receive alerts on companion device</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={push}
                    onChange={(e) => setPush(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">Email Notifications</span>
                      <span className="text-xs text-slate-400 block">Receive summary emails</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* Notification Categories */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Notification Categories
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <span className="text-sm font-bold text-white">Daily Routine & Reminder Alerts</span>
                  <input
                    type="checkbox"
                    checked={reminders}
                    onChange={(e) => setReminders(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <span className="text-sm font-bold text-white">Community Session Alerts</span>
                  <input
                    type="checkbox"
                    checked={community}
                    onChange={(e) => setCommunity(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                  <span className="text-sm font-bold text-white">Meeting Circle Room Alerts</span>
                  <input
                    type="checkbox"
                    checked={meetings}
                    onChange={(e) => setMeetings(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
