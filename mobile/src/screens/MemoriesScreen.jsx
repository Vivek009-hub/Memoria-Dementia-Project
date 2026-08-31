/**
 * MemoriesScreen.jsx — Memory Library Screen (Phase F5 / B5)
 *
 * Full memory vault interface featuring:
 * - Search bar with debounced query execution
 * - Category filter pills (All, Photo, Person, Place, Story, Event, Object)
 * - Sorting controls (Newest, Oldest)
 * - Pagination controls
 * - Empty, Loading, and Error States with Retry handling
 * - Modal triggers for Create, View Details, Edit, Delete, and Family Directory
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

export function MemoriesScreen({ patientId }) {
  const [memories, setMemories] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Query parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Modal states
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  const [familyDirOpen, setFamilyDirOpen] = useState(false);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch memories list
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

  // Fetch family members directory
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

  // Handlers
  const handleSaveMemory = async (formData, memoryId) => {
    if (memoryId) {
      await memoriesApi.updateMemory(memoryId, formData);
    } else {
      await memoriesApi.createMemory({ ...formData, patientId });
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Vault</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Memories</h1>
          <p className="text-sm text-slate-400 mt-1">
            Revisit your cherished moments, people, places, and stories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFamilyDirOpen(true)}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-sm rounded-2xl border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Family Directory</span>
          </button>

          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search + Category Filters + Sort */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your memories by word, name, or place..."
            className="w-full pl-12 pr-10 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading your memories...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">We Couldn't Load Your Memories</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={fetchMemories}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-4">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">No Memories Found</h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              {debouncedSearch || selectedCategory
                ? 'No memories match your current search or category filter. Try clearing your filters or adding a new memory.'
                : 'Add a meaningful moment to your personal collection to keep it safe and searchable with Memora.'}
            </p>
          </div>
          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-lg inline-flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Memory</span>
          </button>
        </div>
      ) : (
        <>
          {/* Memory Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map((mem) => (
              <MemoryCard
                key={mem._id}
                memory={mem}
                onSelect={(selected) => setSelectedMemory(selected)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-sm">
              <span className="text-slate-400 text-xs font-bold">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl text-white font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl text-white font-bold"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
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

      {/* Create / Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <DeleteMemoryDialog
        memory={memoryToDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMemoryToDelete(null);
        }}
        onConfirmDelete={handleDeleteMemory}
      />

      {/* Family Directory Modal */}
      <FamilyDirectoryModal
        familyMembers={familyMembers}
        isOpen={familyDirOpen}
        onClose={() => setFamilyDirOpen(false)}
        onAddFamilyMember={handleAddFamilyMember}
      />
    </div>
  );
}
