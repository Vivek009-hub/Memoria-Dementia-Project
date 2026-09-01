/**
 * FamilyDirectoryModal.jsx — Memora Family Directory Management Modal
 */

import React, { useState } from 'react';
import { X, UserPlus, Users, User, Plus } from 'lucide-react';

export function FamilyDirectoryModal({ familyMembers = [], isOpen, onClose, onAddFamilyMember }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !relationship.trim()) {
      setErrorMsg('Name and Relationship are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await onAddFamilyMember({
        name: name.trim(),
        relationship: relationship.trim(),
        photoUrl: photoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setRelationship('');
      setPhotoUrl('');
      setNotes('');
      setShowAddForm(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add family member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-dir-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#343434] bg-[#1B1B1B]">
          <div className="flex items-center space-x-2 text-[#D8B24C]">
            <Users className="w-5 h-5" />
            <h2 id="family-dir-title" className="text-xl font-semibold text-[#F5F5F0]">
              Family & Recognized People
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-3.5 bg-[#D8B24C]/10 hover:bg-[#D8B24C]/20 border border-[#D8B24C]/30 text-[#D8B24C] font-semibold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Family Member</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-[#151515] border border-[#D8B24C]/30 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-[#F5F5F0] flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#D8B24C]" />
                <span>New Family Member</span>
              </h3>

              {errorMsg && (
                <p className="text-xs text-[#D95C5C] font-medium">{errorMsg}</p>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full p-2.5 bg-[#202020] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Daughter, Grandson"
                  className="w-full p-2.5 bg-[#202020] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-2.5 bg-[#202020] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-2 bg-[#202020] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] text-xs font-semibold rounded-lg shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          )}

          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-[#74746F]">
              <User className="w-10 h-10 mx-auto mb-2 opacity-50 stroke-1" />
              <p className="text-xs">No family members registered yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {familyMembers.map((member) => (
                <div key={member._id} className="p-3.5 bg-[#151515] border border-[#343434] rounded-lg flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#202020] border border-[#343434] overflow-hidden flex items-center justify-center shrink-0">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-[#74746F]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#F5F5F0] truncate">{member.name}</h4>
                    <span className="text-[11px] font-medium text-[#D8B24C] bg-[#D8B24C]/10 px-2 py-0.5 rounded border border-[#D8B24C]/20 inline-block">
                      {member.relationship}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
