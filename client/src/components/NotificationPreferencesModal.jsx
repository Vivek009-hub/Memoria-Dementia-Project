/**
 * NotificationPreferencesModal.jsx — Memora Notification Preferences Settings Modal
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Mail, Smartphone, AlertCircle } from 'lucide-react';
import * as notificationsApi from '../api/notifications.api.js';

export function NotificationPreferencesModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [inApp, setInApp] = useState(true);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);

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
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pref-modal-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#343434] bg-[#1B1B1B]">
          <div className="flex items-center space-x-2 text-[#D8B24C]">
            <Bell className="w-5 h-5" />
            <h2 id="pref-modal-title" className="text-xl font-semibold text-[#F5F5F0]">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#A7A7A2]">
            <Bell className="w-8 h-8 animate-bounce mx-auto mb-2 text-[#D8B24C]" />
            <p className="font-semibold text-sm">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg text-[#D95C5C] text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-[#45B982]/10 border border-[#45B982]/30 rounded-lg text-[#45B982] text-xs font-medium">
                {successMsg}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D8B24C]">
                Delivery Channels
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3.5 bg-[#151515] rounded-lg border border-[#343434] cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-[#D8B24C]" />
                    <div>
                      <span className="text-xs font-semibold text-[#F5F5F0] block">In-App Notifications</span>
                      <span className="text-[11px] text-[#A7A7A2] block">Show alerts inside Memora</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={inApp}
                    onChange={(e) => setInApp(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#151515] rounded-lg border border-[#343434] cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-4 h-4 text-[#45B982]" />
                    <div>
                      <span className="text-xs font-semibold text-[#F5F5F0] block">Mobile Push Notifications</span>
                      <span className="text-[11px] text-[#A7A7A2] block">Receive alerts on companion device</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={push}
                    onChange={(e) => setPush(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#151515] rounded-lg border border-[#343434] cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-[#E5A83B]" />
                    <div>
                      <span className="text-xs font-semibold text-[#F5F5F0] block">Email Notifications</span>
                      <span className="text-[11px] text-[#A7A7A2] block">Receive summary emails</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D8B24C]">
                Notification Categories
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3.5 bg-[#151515] rounded-lg border border-[#343434] cursor-pointer">
                  <span className="text-xs font-semibold text-[#F5F5F0]">Daily Routine & Reminder Alerts</span>
                  <input
                    type="checkbox"
                    checked={reminders}
                    onChange={(e) => setReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#151515] rounded-lg border border-[#343434] cursor-pointer">
                  <span className="text-xs font-semibold text-[#F5F5F0]">Community Session Alerts</span>
                  <input
                    type="checkbox"
                    checked={community}
                    onChange={(e) => setCommunity(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#151515] rounded-lg border border-[#343434] cursor-pointer">
                  <span className="text-xs font-semibold text-[#F5F5F0]">Meeting Circle Room Alerts</span>
                  <input
                    type="checkbox"
                    checked={meetings}
                    onChange={(e) => setMeetings(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#343434] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
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
