/**
 * AdminCommunityProposalModal.jsx — Memora Admin Modal to Create New Voting Proposals
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
    <div className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#343434] pb-3">
          <div className="flex items-center space-x-2 text-[#D8B24C]">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-xl font-semibold text-[#F5F5F0]">Create Voting Proposal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
              Proposal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Classical Music & Memory Hour"
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
            >
              <option value="MUSIC">Music & Sound Therapy</option>
              <option value="ART">Art & Reminiscence</option>
              <option value="EXERCISE">Gentle Physical Wellness</option>
              <option value="STORYTELLING">Storytelling & Sharing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the session topic and benefits for dementia patients..."
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F] resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
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
