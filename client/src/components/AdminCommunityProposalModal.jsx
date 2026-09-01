/**
 * AdminCommunityProposalModal.jsx — Modal for Admins to Create New Voting Proposals
 */

import React, { useState } from 'react';
import { X, Sparkles, PlusCircle } from 'lucide-react';

export function AdminCommunityProposalModal({ isOpen, onClose, onSubmit, onCreateProposal }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('MUSIC');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    const submitFn = onSubmit || onCreateProposal;
    if (!submitFn) return;

    setSubmitting(true);
    try {
      await submitFn({ title, description, category });
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-xl font-black text-white">Create Voting Proposal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Proposal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Classical Music & Memory Hour"
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="MUSIC">Music & Sound Therapy</option>
              <option value="ART">Art & Reminiscence</option>
              <option value="EXERCISE">Gentle Physical Wellness</option>
              <option value="STORYTELLING">Storytelling & Sharing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the session topic and benefits for dementia patients..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-sm rounded-2xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Posting...' : 'Post Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
