/**
 * CreateEditMemoryModal.jsx — Elder-Friendly Create/Edit Memory Form Modal
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Camera, User, MapPin, BookOpen, Calendar, Heart, Tag } from 'lucide-react';

const MEMORY_TYPES = [
  { id: 'PHOTO', label: 'Photo', icon: Camera },
  { id: 'PERSON', label: 'Person', icon: User },
  { id: 'PLACE', label: 'Place', icon: MapPin },
  { id: 'STORY', label: 'Story', icon: BookOpen },
  { id: 'EVENT', label: 'Event', icon: Calendar },
  { id: 'OBJECT', label: 'Object', icon: Heart },
];

const DATE_PRECISION_OPTIONS = [
  { id: 'exact', label: 'Exact Date' },
  { id: 'month', label: 'Month & Year' },
  { id: 'year', label: 'Year Only' },
  { id: 'unknown', label: 'Approximate / Unknown' },
];

export function CreateEditMemoryModal({ memory, familyMembers = [], isOpen, onClose, onSave }) {
  const isEditing = Boolean(memory && memory._id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PHOTO');
  const [mediaUrl, setMediaUrl] = useState('');
  const [relatedPlace, setRelatedPlace] = useState('');
  const [importantDate, setImportantDate] = useState('');
  const [datePrecision, setDatePrecision] = useState('exact');
  const [relatedPersonId, setRelatedPersonId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form fields if editing
  useEffect(() => {
    if (memory) {
      setTitle(memory.title || '');
      setDescription(memory.description || '');
      setType(memory.type || 'PHOTO');
      setMediaUrl(memory.mediaUrl || memory.thumbnailUrl || '');
      setRelatedPlace(memory.relatedPlace || '');
      setDatePrecision(memory.datePrecision || 'exact');
      setRelatedPersonId(
        typeof memory.relatedPersonId === 'object'
          ? memory.relatedPersonId?._id || ''
          : memory.relatedPersonId || ''
      );
      setTagsInput(Array.isArray(memory.tags) ? memory.tags.join(', ') : '');

      if (memory.importantDate) {
        try {
          const d = new Date(memory.importantDate);
          if (!isNaN(d.getTime())) {
            setImportantDate(d.toISOString().split('T')[0]);
          } else {
            setImportantDate('');
          }
        } catch {
          setImportantDate('');
        }
      } else {
        setImportantDate('');
      }
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setType('PHOTO');
      setMediaUrl('');
      setRelatedPlace('');
      setImportantDate('');
      setDatePrecision('exact');
      setRelatedPersonId('');
      setTagsInput('');
    }
    setErrorMsg('');
  }, [memory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission

    if (!title.trim()) {
      setErrorMsg('Please enter a title for this memory.');
      return;
    }

    if (title.length > 200) {
      setErrorMsg('Title cannot exceed 200 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    // Parse tags from comma separated string
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      mediaUrl: mediaUrl.trim() || undefined,
      relatedPlace: relatedPlace.trim() || undefined,
      importantDate: importantDate ? new Date(importantDate).toISOString() : undefined,
      datePrecision,
      relatedPersonId: relatedPersonId || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
    };

    try {
      await onSave(payload, memory?._id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save memory. Please check your entries and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-memora-surface border border-memora-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-memora-border bg-memora-surface-secondary">
          <h2 id="modal-title" className="text-xl font-extrabold text-memora-text flex items-center space-x-2">
            <span>{isEditing ? '✏️ Edit Memory' : '💭 Add a Memory'}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-memora-text-muted hover:text-memora-text rounded-xl bg-memora-surface hover:bg-memora-surface-hover transition-colors"
            aria-label="Cancel memory creation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-start space-x-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
              Memory Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Family Summer Picnic at the Park"
              className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
            />
          </div>

          {/* Type Selector Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
              Memory Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEMORY_TYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`p-3 rounded-2xl border text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                      isSelected
                        ? 'bg-memora-accent border-memora-accent text-memora-bg font-black shadow-lg'
                        : 'bg-memora-surface-secondary border-memora-border text-memora-text-muted hover:text-memora-text'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
              What do you remember?
            </label>
            <textarea
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, who was there, or how you felt..."
              className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
            />
          </div>

          {/* Date & Date Precision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
                Date of Memory
              </label>
              <input
                type="date"
                value={importantDate}
                onChange={(e) => setImportantDate(e.target.value)}
                className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
                Date Accuracy
              </label>
              <select
                value={datePrecision}
                onChange={(e) => setDatePrecision(e.target.value)}
                className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
              >
                {DATE_PRECISION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Related Place & Family Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
                Location / Place
              </label>
              <input
                type="text"
                maxLength={300}
                value={relatedPlace}
                onChange={(e) => setRelatedPlace(e.target.value)}
                placeholder="e.g. Grandma's House, Chicago"
                className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
              />
            </div>

            {familyMembers && familyMembers.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
                  Related Family Member
                </label>
                <select
                  value={relatedPersonId}
                  onChange={(e) => setRelatedPersonId(e.target.value)}
                  className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
                >
                  <option value="">-- None --</option>
                  {familyMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.relationship})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Photo / Media URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
              Photo URL
            </label>
            <input
              type="url"
              maxLength={2048}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-memora-text-muted mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. summer, vacation, family"
              className="w-full p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-memora-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 bg-memora-surface-secondary hover:bg-memora-surface-hover text-memora-text-muted text-base font-bold rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-memora-accent hover:bg-memora-accent-bright disabled:opacity-50 text-memora-bg text-base font-extrabold rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
            >
              <Save className="w-5 h-5" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Memory' : 'Add Memory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
