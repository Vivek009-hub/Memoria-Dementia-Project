/**
 * EmergencyContacts.jsx — Elder-friendly emergency contacts list component
 */

import React, { useState, useEffect } from 'react';
import { PhoneCall, UserCheck } from 'lucide-react';
import { request } from '../api/client.js';

export function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await request('/patients/me/emergency-contacts');
        if (res.success && res.data) {
          setContacts(res.data);
        }
      } catch {
        // Fallback default sample contacts
        setContacts([
          { _id: '1', name: 'Primary Family Caregiver', relationship: 'FAMILY', phone: '+1 (555) 019-2831', isPrimary: true },
          { _id: '2', name: 'Doctor Specialist', relationship: 'DOCTOR', phone: '+1 (555) 019-8822', isPrimary: false },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, []);

  return (
    <div className="w-full max-w-md p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg">
      <div className="flex items-center space-x-2 mb-3">
        <PhoneCall className="w-6 h-6 text-emerald-400" />
        <h3 className="text-xl font-bold text-slate-100">Emergency Contacts</h3>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-2">Loading contacts...</p>
      ) : contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div
              key={c._id}
              className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-slate-100">{c.name}</span>
                  {c.isPrimary && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  {c.relationship} • {c.phone}
                </p>
              </div>

              <a
                href={`tel:${c.phone}`}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center touch-target-xl shadow-md active:scale-95 transition-transform"
                aria-label={`Call ${c.name}`}
              >
                <PhoneCall className="w-6 h-6" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-800/40 rounded-2xl text-center text-slate-400 text-sm">
          No emergency contacts configured yet.
        </div>
      )}
    </div>
  );
}
