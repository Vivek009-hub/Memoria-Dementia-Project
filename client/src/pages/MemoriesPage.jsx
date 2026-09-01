/**
 * MemoriesPage.jsx — Memory Library Page (Phase F5 / B5)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Search, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
  Users, SlidersHorizontal
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B24C] mb-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Memory Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">Memories</h1>
          <p className="text-sm text-[#A7A7A2] mt-1">
            Revisit your family photographs, stories, places, and personal moments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFamilyDirOpen(true)}
            className="px-4 py-2.5 bg-transparent hover:bg-[#242424] text-[#F5F5F0] font-medium text-sm rounded-lg border border-[#343434] flex items-center space-x-2 transition-colors touch-target"
          >
            <Users className="w-4 h-4 text-[#D8B24C]" />
            <span>Family Directory</span>
          </button>

          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-sm rounded-lg flex items-center space-x-2 transition-colors shadow-xs touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#74746F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by title, description, or place..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] font-normal text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7A7A2] hover:text-[#F5F5F0] font-medium text-xs bg-[#242424] px-2 py-0.5 rounded"
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
                    ? 'bg-[#D8B24C] text-[#151515] font-semibold'
                    : 'bg-[#151515] border border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0] hover:bg-[#242424]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#74746F]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#151515] border border-[#343434] text-[#F5F5F0] text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D8B24C]"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] text-sm">Loading your memories...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#202020] border border-[#D95C5C]/30 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Could Not Load Memories</h3>
            <p className="text-sm text-[#A7A7A2]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchMemories}
            className="px-4 py-2 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-sm rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#D8B24C]/10 border border-[#D8B24C]/20 rounded-full flex items-center justify-center mx-auto text-[#D8B24C]">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#F5F5F0] mb-2">No Memories Found</h3>
            <p className="text-[#A7A7A2] max-w-md mx-auto text-sm leading-relaxed">
              {debouncedSearch || selectedCategory
                ? 'No memories match your current search or category filter. Try clearing filters or adding a new memory.'
                : 'Start building your Memory Vault by adding your first photograph or story.'}
            </p>
          </div>
          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-sm rounded-lg inline-flex items-center space-x-2 transition-colors shadow-xs"
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
            <div className="bg-[#202020] border border-[#343434] rounded-xl p-4 flex items-center justify-between text-sm">
              <span className="text-[#A7A7A2] text-xs font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-[#151515] border border-[#343434] disabled:opacity-40 rounded-lg text-[#F5F5F0]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 bg-[#151515] border border-[#343434] disabled:opacity-40 rounded-lg text-[#F5F5F0]"
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
