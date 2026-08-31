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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [relatedPlace, setRelatedPlace] = useState('');
  const [importantDate, setImportantDate] = useState('');
  const [datePrecision, setDatePrecision] = useState('exact');
  const [relatedPersonId, setRelatedPersonId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
  }, [memory, isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Selected photo exceeds the 10MB file size limit.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

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

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (selectedFile) {
        // Submit using FormData for local file upload
        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('title', title.trim());
        if (description.trim()) formData.append('description', description.trim());
        formData.append('type', type);
        if (relatedPlace.trim()) formData.append('relatedPlace', relatedPlace.trim());
        if (importantDate) formData.append('importantDate', new Date(importantDate).toISOString());
        formData.append('datePrecision', datePrecision);
        if (relatedPersonId) formData.append('relatedPersonId', relatedPersonId);
        if (parsedTags.length > 0) {
          parsedTags.forEach((tag) => formData.append('tags', tag));
        }

        await onSave(formData, memory?._id);
      } else {
        // Submit JSON object if no local file selected (e.g. text or URL)
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

        await onSave(payload, memory?._id);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save memory. Please check your entries and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeImagePreview = previewUrl || (mediaUrl ? mediaUrl : null);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <h2 id="modal-title" className="text-xl font-extrabold text-white flex items-center space-x-2">
            <span>{isEditing ? '✏️ Edit Memory' : '💭 Add a Memory'}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
            aria-label="Cancel memory creation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-start space-x-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Memory Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Family Summer Picnic at the Park"
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
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
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Local Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Memory Photo
            </label>
            
            {activeImagePreview ? (
              <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group">
                <img
                  src={activeImagePreview}
                  alt="Memory preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all">
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveSelectedFile}
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label className="w-full p-6 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all">
                <Camera className="w-8 h-8 text-indigo-400" />
                <div className="text-center">
                  <span className="text-sm font-extrabold text-white">Click to upload a photo</span>
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}

            {/* Optional URL input fallback */}
            {!selectedFile && (
              <details className="text-xs text-slate-400 mt-1">
                <summary className="cursor-pointer hover:text-slate-300 font-bold">Or enter photo URL directly</summary>
                <input
                  type="url"
                  maxLength={2048}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-3 mt-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </details>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              What do you remember?
            </label>
            <textarea
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, who was there, or how you felt..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Date of Memory
              </label>
              <input
                type="date"
                value={importantDate}
                onChange={(e) => setImportantDate(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Date Accuracy
              </label>
              <select
                value={datePrecision}
                onChange={(e) => setDatePrecision(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {DATE_PRECISION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Location / Place
              </label>
              <input
                type="text"
                maxLength={300}
                value={relatedPlace}
                onChange={(e) => setRelatedPlace(e.target.value)}
                placeholder="e.g. Grandma's House, Chicago"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {familyMembers && familyMembers.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Related Family Member
                </label>
                <select
                  value={relatedPersonId}
                  onChange={(e) => setRelatedPersonId(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. summer, vacation, family"
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-base font-bold rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-base font-extrabold rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
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
