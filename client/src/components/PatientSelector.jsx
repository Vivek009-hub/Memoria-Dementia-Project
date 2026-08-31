/**
 * PatientSelector.jsx — Caregiver Dropdown to Select Authorized Patient
 */

import React from 'react';
import { User, Users, ChevronDown, ShieldCheck } from 'lucide-react';

export function PatientSelector({ patients = [], selectedPatientId, onSelectPatient }) {
  if (patients.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 font-bold flex items-center space-x-2">
        <Users className="w-4 h-4 text-amber-400" />
        <span>No patients currently assigned</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left w-full sm:w-auto">
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <User className="w-4 h-4" />
        </div>

        <select
          value={selectedPatientId}
          onChange={(e) => onSelectPatient(e.target.value)}
          className="bg-transparent text-white font-extrabold text-sm focus:outline-none cursor-pointer pr-8 py-1 truncate"
          aria-label="Select authorized patient"
        >
          {patients.map((rel) => {
            const pObj = rel.patientId || rel.patient || rel;
            const pId = pObj._id || pObj.id || pObj;
            const pName = pObj.name || pObj.email || 'Assigned Patient';
            const relType = rel.relationshipType || 'Family Caregiver';

            return (
              <option key={pId} value={pId} className="bg-slate-950 text-white font-medium">
                {pName} ({relType})
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
