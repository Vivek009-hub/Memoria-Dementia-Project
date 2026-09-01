/**
 * PatientSelector.jsx — Caregiver Dropdown to Select Authorized Patient
 */

import React from 'react';
import { User, Users } from 'lucide-react';

export function PatientSelector({ patients = [], selectedPatientId, onSelectPatient }) {
  if (patients.length === 0) {
    return (
      <div className="bg-[#202020] border border-[#343434] rounded-lg p-2.5 text-xs text-[#A7A7A2] font-medium flex items-center space-x-2">
        <Users className="w-4 h-4 text-[#D8B24C]" />
        <span>No patients currently assigned</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left w-full sm:w-auto">
      <div className="flex items-center space-x-2 bg-[#202020] border border-[#343434] p-1.5 rounded-lg">
        <div className="w-7 h-7 rounded-md bg-[#D8B24C]/10 border border-[#D8B24C]/30 flex items-center justify-center text-[#D8B24C] shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>

        <select
          value={selectedPatientId}
          onChange={(e) => onSelectPatient(e.target.value)}
          className="bg-transparent text-[#F5F5F0] font-semibold text-xs focus:outline-none cursor-pointer pr-6 py-1 truncate"
          aria-label="Select authorized patient"
        >
          {patients.map((rel) => {
            const pObj = rel.patientId || rel.patient || rel;
            const pId = pObj._id || pObj.id || pObj;
            const pName = pObj.name || pObj.email || 'Assigned Patient';
            const relType = rel.relationshipType || 'Family Caregiver';

            return (
              <option key={pId} value={pId} className="bg-[#151515] text-[#F5F5F0]">
                {pName} ({relType})
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
