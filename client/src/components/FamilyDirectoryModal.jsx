/**
 * FamilyDirectoryModal.jsx — Familiar Face & Family Directory Management
 */

import React, { useState } from 'react';
import { X, UserPlus, Users, User, Image, AlertCircle, Plus } from 'lucide-react';

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-dir-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Users className="w-6 h-6" />
            <h2 id="family-dir-title" className="text-xl font-extrabold text-white">
              Family & Recognized People
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Family Member</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>New Family Member</span>
              </h3>

              {errorMsg && (
                <p className="text-xs text-red-400 font-bold">{errorMsg}</p>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Daughter, Grandson"
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          )}

          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No family members registered yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member._id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white truncate">{member.name}</h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 inline-block">
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
