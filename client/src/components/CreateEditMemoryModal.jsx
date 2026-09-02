/**
 * CreateEditMemoryModal.jsx — Memora Elder-Friendly Create/Edit Memory Form Modal
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Camera, User, MapPin, BookOpen, Calendar, Heart } from 'lucide-react';
import { VoiceNoteRecorder } from './VoiceNoteRecorder.jsx';

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
  const targetMemoryId = memory?._id || memory?.id;
  const isEditing = Boolean(memory && targetMemoryId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PHOTO');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedAudioBlob, setSelectedAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [existingAudioUrl, setExistingAudioUrl] = useState('');

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
      setExistingAudioUrl(memory.voiceNote?.audioUrl || memory.audioUrl || '');
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
      setExistingAudioUrl('');
      setRelatedPlace('');
      setImportantDate('');
      setDatePrecision('exact');
      setRelatedPersonId('');
      setTagsInput('');
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedAudioBlob(null);
    setAudioDuration(0);
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

  const handleAudioRecorded = (blob, durationSec, mimeType) => {
    setSelectedAudioBlob(blob);
    setAudioDuration(durationSec);
  };

  const handleAudioRemoved = () => {
    setSelectedAudioBlob(null);
    setAudioDuration(0);
    setExistingAudioUrl('');
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
      if (selectedFile || selectedAudioBlob) {
        const formData = new FormData();
        if (selectedFile) formData.append('photo', selectedFile);
        if (selectedAudioBlob) {
          const ext = selectedAudioBlob.type.includes('mp4') ? 'mp4' : 'webm';
          formData.append('voiceNote', selectedAudioBlob, `voice-note.${ext}`);
          formData.append('audioDuration', audioDuration);
        }

        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('type', type);
        formData.append('mediaUrl', mediaUrl.trim());
        formData.append('audioUrl', existingAudioUrl || '');
        formData.append('relatedPlace', relatedPlace.trim());
        formData.append('importantDate', importantDate ? new Date(importantDate).toISOString() : '');
        formData.append('datePrecision', datePrecision);
        formData.append('relatedPersonId', relatedPersonId || '');
        if (parsedTags.length > 0) {
          parsedTags.forEach((tag) => formData.append('tags', tag));
        } else {
          formData.append('tags', '');
        }

        await onSave(formData, targetMemoryId);
      } else {
        const payload = {
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          type,
          mediaUrl: mediaUrl.trim() ? mediaUrl.trim() : null,
          audioUrl: existingAudioUrl ? existingAudioUrl : null,
          relatedPlace: relatedPlace.trim() ? relatedPlace.trim() : null,
          importantDate: importantDate ? new Date(importantDate).toISOString() : null,
          datePrecision,
          relatedPersonId: relatedPersonId ? relatedPersonId : null,
          tags: parsedTags.length > 0 ? parsedTags : [],
        };

        await onSave(payload, targetMemoryId);
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
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#343434] bg-[#1B1B1B]">
          <h2 id="modal-title" className="text-xl font-semibold text-[#F5F5F0] flex items-center space-x-2">
            <span>{isEditing ? '✏️ Edit Memory' : '💭 Add Memory'}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
            aria-label="Cancel memory creation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg flex items-start space-x-3 text-[#D95C5C] text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-[#D95C5C] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Memory Title <span className="text-[#D95C5C]">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Family Summer Picnic at the Park"
              className="w-full p-3.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] font-normal text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Memory Category <span className="text-[#D95C5C]">*</span>
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
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                      isSelected
                        ? 'bg-[#D8B24C] border-[#D8B24C] text-[#151515] shadow-xs'
                        : 'bg-[#151515] border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0] hover:border-[#343434]/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2]">
              Memory Photo
            </label>

            {activeImagePreview ? (
              <div className="relative w-full h-48 bg-[#151515] rounded-lg overflow-hidden border border-[#343434] group">
                <img
                  src={activeImagePreview}
                  alt="Memory preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#151515]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <label className="px-4 py-2 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-xs">
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
                      className="px-4 py-2 bg-[#D95C5C] hover:bg-[#D95C5C]/90 text-[#F5F5F0] font-semibold text-xs rounded-lg transition-colors shadow-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label className="w-full p-6 border border-dashed border-[#343434] hover:border-[#D8B24C]/60 rounded-lg bg-[#151515] hover:bg-[#1B1B1B] flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors">
                <Camera className="w-8 h-8 text-[#D8B24C]" />
                <div className="text-center">
                  <span className="text-sm font-semibold text-[#F5F5F0]">Click to upload a photo</span>
                  <p className="text-xs text-[#A7A7A2] mt-1">JPEG, PNG, WEBP, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}

            {!selectedFile && (
              <details className="text-xs text-[#A7A7A2] mt-1">
                <summary className="cursor-pointer hover:text-[#F5F5F0] font-medium">Or enter photo URL directly</summary>
                <input
                  type="url"
                  maxLength={2048}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-3 mt-2 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-xs focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
                />
              </details>
            )}
          </div>

          {/* Voice Note Recorder Section */}
          <VoiceNoteRecorder
            onAudioRecorded={handleAudioRecorded}
            onAudioRemoved={handleAudioRemoved}
            existingAudioUrl={existingAudioUrl}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              What do you remember?
            </label>
            <textarea
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, who was there, or how you felt..."
              className="w-full p-3.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                Date of Memory
              </label>
              <input
                type="date"
                value={importantDate}
                onChange={(e) => setImportantDate(e.target.value)}
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                Date Accuracy
              </label>
              <select
                value={datePrecision}
                onChange={(e) => setDatePrecision(e.target.value)}
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                Location / Place
              </label>
              <input
                type="text"
                maxLength={300}
                value={relatedPlace}
                onChange={(e) => setRelatedPlace(e.target.value)}
                placeholder="e.g. Grandma's House, Chicago"
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
              />
            </div>

            {familyMembers && familyMembers.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                  Related Family Member
                </label>
                <select
                  value={relatedPersonId}
                  onChange={(e) => setRelatedPersonId(e.target.value)}
                  className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. summer, vacation, family"
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#343434] flex items-center justify-end space-x-3">
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
              className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Memory' : 'Save Memory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
