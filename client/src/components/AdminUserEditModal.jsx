/**
 * AdminUserEditModal.jsx — Admin User Role & Status Modal Dialog
 */

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export function AdminUserEditModal({ user, isOpen, onClose, onSaveSuccess }) {
  const [role, setRole] = useState('PATIENT');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setRole(user.role || 'PATIENT');
      setIsActive(user.isActive !== false);
      setErrorMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await onSaveSuccess({ userId: user.id || user._id, role, isActive });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user account settings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Edit User Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user.name} ({user.email})</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs font-bold text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              User Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['PATIENT', 'CAREGIVER', 'HOST', 'ADMIN'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-2xl border font-bold text-xs transition-all ${
                    role === r
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Account Status Toggle */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Account Access Status</span>
              <span className="text-[11px] text-slate-400">
                {isActive ? 'Account active and allowed to log in' : 'Account suspended'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-950 text-red-300 border border-red-500/30'
              }`}
            >
              {isActive ? 'Active' : 'Suspended'}
            </button>
          </div>

          {user.role === 'ADMIN' && role !== 'ADMIN' && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] font-semibold text-amber-300 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Revoking Admin role requires at least one other active Administrator account.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 touch-target-xl"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
