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
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pref-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-indigo-600 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2 text-indigo-700">
            <Bell className="w-6 h-6" />
            <h2 id="pref-modal-title" className="text-2xl font-black text-slate-900">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-10 h-10 animate-bounce mx-auto mb-3 text-indigo-600" />
            <p className="font-bold text-base">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-bold">
                {successMsg}
              </div>
            )}

            {/* Notification Channels */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Delivery Channels
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">In-App Notifications</span>
                      <span className="text-xs text-slate-500 block">Show alerts inside Memora</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={inApp}
                    onChange={(e) => setInApp(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Mobile Push Notifications</span>
                      <span className="text-xs text-slate-500 block">Receive alerts on companion device</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={push}
                    onChange={(e) => setPush(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Email Notifications</span>
                      <span className="text-xs text-slate-500 block">Receive summary emails</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>
              </div>
            </div>

            {/* Notification Categories */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Notification Categories
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <span className="text-sm font-bold text-slate-900">Daily Routine & Reminder Alerts</span>
                  <input
                    type="checkbox"
                    checked={reminders}
                    onChange={(e) => setReminders(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <span className="text-sm font-bold text-slate-900">Community Session Alerts</span>
                  <input
                    type="checkbox"
                    checked={community}
                    onChange={(e) => setCommunity(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <span className="text-sm font-bold text-slate-900">Meeting Circle Room Alerts</span>
                  <input
                    type="checkbox"
                    checked={meetings}
                    onChange={(e) => setMeetings(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center space-x-2 transition-all"
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
