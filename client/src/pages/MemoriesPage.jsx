/**
 * MemoriesPage.jsx — Memory Library Page (Phase F5 / B5)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Search, Filter, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
  Users, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { MemoryCard } from '../components/MemoryCard.jsx';
import { MemoryDetailModal } from '../components/MemoryDetailModal.jsx';
import { CreateEditMemoryModal } from '../components/CreateEditMemoryModal.jsx';
import { DeleteMemoryDialog } from '../components/DeleteMemoryDialog.jsx';
import { FamilyDirectoryModal } from '../components/FamilyDirectoryModal.jsx';
import * as memoriesApi from '../api/memories.api.js';

const CATEGORY_FILTERS = [
  { id: '', label: 'All' },
  { id: 'PHOTO', label: 'Photos' },
  { id: 'PERSON', label: 'People' },
  { id: 'PLACE', label: 'Places' },
  { id: 'STORY', label: 'Stories' },
  { id: 'EVENT', label: 'Events' },
  { id: 'OBJECT', label: 'Objects' },
];

export function MemoriesPage({ patientId }) {
  const [memories, setMemories] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  const [familyDirOpen, setFamilyDirOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await memoriesApi.listMemories({
        search: debouncedSearch || undefined,
        type: selectedCategory || undefined,
        sort: sortOrder,
        page,
        limit: 10,
        patientId,
      });

      if (res.data) {
        setMemories(res.data);
      } else {
        setMemories([]);
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setErrorMsg(err.message || 'We couldn\'t load your memories right now.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortOrder, page, patientId]);

  const fetchFamilyMembers = useCallback(async () => {
    try {
      const res = await memoriesApi.listFamilyMembers({ patientId });
      if (res.data) {
        setFamilyMembers(res.data);
      }
    } catch {
      // Non-blocking error
    }
  }, [patientId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const handleSaveMemory = async (formDataOrPayload, memoryId) => {
    if (formDataOrPayload instanceof FormData) {
      if (patientId) formDataOrPayload.append('patientId', patientId);
      if (memoryId) {
        await memoriesApi.updateMemory(memoryId, formDataOrPayload);
      } else {
        await memoriesApi.createMemory(formDataOrPayload);
      }
    } else {
      const payload = { ...formDataOrPayload };
      if (patientId) payload.patientId = patientId;
      if (memoryId) {
        await memoriesApi.updateMemory(memoryId, payload);
      } else {
        await memoriesApi.createMemory(payload);
      }
    }
    fetchMemories();
  };

  const handleDeleteMemory = async (memoryId) => {
    await memoriesApi.deleteMemory(memoryId, patientId);
    if (selectedMemory && selectedMemory._id === memoryId) {
      setSelectedMemory(null);
    }
    fetchMemories();
  };

  const handleAddFamilyMember = async (memberData) => {
    await memoriesApi.createFamilyMember({ ...memberData, patientId });
    fetchFamilyMembers();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#252525] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#DDBB55] mb-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Memory Journal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#E8E8E8] tracking-tight">Memories</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Revisit your family photographs, stories, places, and personal moments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFamilyDirOpen(true)}
            className="px-4 py-2.5 bg-transparent hover:bg-[#2A2A2A] text-[#E8E8E8] font-medium text-sm rounded-lg border border-[#343434] flex items-center space-x-2 transition-colors"
          >
            <Users className="w-4 h-4 text-[#DDBB55]" />
            <span>Family Directory</span>
          </button>

          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] font-semibold text-sm rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#252525] border border-[#343434] rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#747474] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by title, description, or place..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#1E1E1E] border border-[#383838] rounded-lg text-[#E8E8E8] font-normal text-sm focus:outline-none focus:border-[#DDBB55] transition-colors placeholder:text-[#747474]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#E8E8E8] font-medium text-xs bg-[#252525] px-2 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#DDBB55] text-[#1E1E1E] font-semibold'
                    : 'bg-[#1E1E1E] border border-[#343434] text-[#A0A0A0] hover:text-[#E8E8E8] hover:bg-[#2A2A2A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#747474]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#1E1E1E] border border-[#343434] text-[#E8E8E8] text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#DDBB55]"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#252525] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#DDBB55] animate-spin mx-auto mb-3" />
          <p className="text-[#A0A0A0] text-sm">Loading your memories...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#252525] border border-[#C95C5C]/30 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#C95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#E8E8E8] mb-1">Could Not Load Memories</h3>
            <p className="text-sm text-[#A0A0A0]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchMemories}
            className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#E8E8E8] font-medium text-sm rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-[#252525] border border-[#343434] rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#DDBB55]/10 border border-[#DDBB55]/20 rounded-full flex items-center justify-center mx-auto text-[#DDBB55]">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#E8E8E8] mb-2">No Memories Found</h3>
            <p className="text-[#A0A0A0] max-w-md mx-auto text-sm leading-relaxed">
              {debouncedSearch || selectedCategory
                ? 'No memories match your current search or category filter. Try clearing filters or adding a new memory.'
                : 'Add a photo or personal memory to your collection to keep it preserved in Memora.'}
            </p>
          </div>
          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] font-semibold text-sm rounded-lg inline-flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Memory</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map((mem) => (
              <MemoryCard
                key={mem._id}
                memory={mem}
                onSelect={(selected) => setSelectedMemory(selected)}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="bg-[#252525] border border-[#343434] rounded-xl p-4 flex items-center justify-between text-sm">
              <span className="text-[#A0A0A0] text-xs font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-[#1E1E1E] border border-[#343434] disabled:opacity-40 rounded-lg text-[#E8E8E8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 bg-[#1E1E1E] border border-[#343434] disabled:opacity-40 rounded-lg text-[#E8E8E8]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onEdit={(mem) => {
            setMemoryToEdit(mem);
            setCreateEditModalOpen(true);
          }}
          onDelete={(mem) => {
            setMemoryToDelete(mem);
            setDeleteModalOpen(true);
          }}
        />
      )}

      <CreateEditMemoryModal
        memory={memoryToEdit}
        familyMembers={familyMembers}
        isOpen={createEditModalOpen}
        onClose={() => {
          setCreateEditModalOpen(false);
          setMemoryToEdit(null);
        }}
        onSave={handleSaveMemory}
      />

      <DeleteMemoryDialog
        memory={memoryToDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMemoryToDelete(null);
        }}
        onConfirmDelete={handleDeleteMemory}
      />

      <FamilyDirectoryModal
        familyMembers={familyMembers}
        isOpen={familyDirOpen}
        onClose={() => setFamilyDirOpen(false)}
        onAddFamilyMember={handleAddFamilyMember}
      />
    </div>
  );
}

