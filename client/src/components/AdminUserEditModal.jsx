/**
 * AdminUserEditModal.jsx — Memora Admin User Role & Status Modal Dialog
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-1.5 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-lg text-[#D8B24C]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#F5F5F0]">Edit User Account</h2>
            <p className="text-xs text-[#A7A7A2] mt-0.5">{user.name} ({user.email})</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg text-xs font-medium text-[#D95C5C] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D95C5C]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider mb-2">
              User Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['PATIENT', 'CAREGIVER', 'HOST', 'ADMIN'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    role === r
                      ? 'bg-[#D8B24C] border-[#D8B24C] text-[#151515] shadow-xs'
                      : 'bg-[#151515] border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-[#151515] border border-[#343434] rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F5F5F0] block">Account Access Status</span>
              <span className="text-[11px] text-[#A7A7A2]">
                {isActive ? 'Account active and allowed to log in' : 'Account suspended'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-[#45B982]/10 text-[#45B982] border border-[#45B982]/30'
                  : 'bg-[#D95C5C]/10 text-[#D95C5C] border border-[#D95C5C]/30'
              }`}
            >
              {isActive ? 'Active' : 'Suspended'}
            </button>
          </div>

          {user.role === 'ADMIN' && role !== 'ADMIN' && (
            <div className="p-3 bg-[#E5A83B]/10 border border-[#E5A83B]/30 rounded-lg text-xs text-[#E5A83B] flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#E5A83B] mt-0.5" />
              <span>
                Revoking Admin role requires at least one other active Administrator account.
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-2 touch-target"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
