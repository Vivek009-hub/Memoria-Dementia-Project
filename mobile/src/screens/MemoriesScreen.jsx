/**
 * MemoriesScreen.jsx — Patient & Caregiver Memory Vault Screen (Phase F7 / B7)
 *
 * Displays personal memories in a responsive grid, with search, category filtering,
 * sort controls, family directory modal, and memory creation/editing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Search, Filter, RefreshCw, AlertTriangle, Users,
  ChevronLeft, ChevronRight, SlidersHorizontal, Image
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { MemoryCard } from '../components/MemoryCard.jsx';
import { MemoryDetailModal } from '../components/MemoryDetailModal.jsx';
import { CreateEditMemoryModal } from '../components/CreateEditMemoryModal.jsx';
import { DeleteMemoryDialog } from '../components/DeleteMemoryDialog.jsx';
import { FamilyDirectoryModal } from '../components/FamilyDirectoryModal.jsx';
import { PatientSelector } from '../components/PatientSelector.jsx';
import * as memoriesApi from '../api/memories.api.js';
import * as caregiverApi from '../api/caregiver.api.js';

const CATEGORY_FILTERS = [
  { id: '', label: 'All' },
  { id: 'PHOTO', label: 'Photos' },
  { id: 'PERSON', label: 'People' },
  { id: 'PLACE', label: 'Places' },
  { id: 'STORY', label: 'Stories' },
  { id: 'EVENT', label: 'Events' },
  { id: 'OBJECT', label: 'Objects' },
];

export function MemoriesScreen({ patientId: propPatientId }) {
  const { user } = useAuth();
  const isCaregiver = user?.role === 'CAREGIVER';

  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(isCaregiver);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [memories, setMemories] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Active target patient ID resolution
  const activePatientId = isCaregiver
    ? selectedPatientId || (propPatientId && propPatientId !== user?.id && propPatientId !== user?._id ? propPatientId : '')
    : propPatientId || user?.id || user?._id;

  // Load caregiver patient relationships if logged in as caregiver
  useEffect(() => {
    if (!isCaregiver) {
      setLoadingRelationships(false);
      return;
    }
    let isMounted = true;
    const fetchRelationships = async () => {
      setLoadingRelationships(true);
      try {
        const res = await caregiverApi.listRelationships();
        const rels = res.data?.relationships || (Array.isArray(res.data) ? res.data : []);
        if (isMounted) {
          if (rels && rels.length > 0) {
            setRelationships(rels);
            const firstPatientObj = rels[0].patientId || rels[0].patient || rels[0];
            const firstId = firstPatientObj._id || firstPatientObj.id || firstPatientObj;
            setSelectedPatientId((prev) => prev || firstId);
          } else {
            setRelationships([]);
          }
        }
      } catch (err) {
        console.error('Failed to load caregiver relationships:', err);
      } finally {
        if (isMounted) setLoadingRelationships(false);
      }
    };

    fetchRelationships();
    return () => {
      isMounted = false;
    };
  }, [isCaregiver]);

  // Filters & Pagination
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

  // Modal states
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  const [familyDirOpen, setFamilyDirOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch memories list
  const fetchMemories = useCallback(async () => {
    if (isCaregiver && !activePatientId) {
      setLoading(false);
      setMemories([]);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await memoriesApi.listMemories({
        type: selectedCategory || undefined,
        search: debouncedSearch || undefined,
        sort: sortOrder,
        page,
        limit: 12,
        patientId: activePatientId,
      });

      if (res.data) {
        setMemories(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setMemories([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'We couldn\'t load your memories right now.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch, sortOrder, page, activePatientId, isCaregiver]);

  // Fetch family members
  const fetchFamilyMembers = useCallback(async () => {
    if (!activePatientId) return;
    try {
      const res = await memoriesApi.listFamilyMembers({ patientId: activePatientId });
      if (res.data) {
        setFamilyMembers(res.data);
      }
    } catch {
      // Non-blocking error
    }
  }, [activePatientId]);

  useEffect(() => {
    if (!loadingRelationships) {
      fetchMemories();
    }
  }, [fetchMemories, loadingRelationships]);

  useEffect(() => {
    if (!loadingRelationships) {
      fetchFamilyMembers();
    }
  }, [fetchFamilyMembers, loadingRelationships]);

  const handleSaveMemory = async (formDataOrPayload, memoryId) => {
    let res;
    if (typeof FormData !== 'undefined' && formDataOrPayload instanceof FormData) {
      if (activePatientId) formDataOrPayload.append('patientId', activePatientId);
      if (memoryId) {
        res = await memoriesApi.updateMemory(memoryId, formDataOrPayload, activePatientId);
      } else {
        res = await memoriesApi.createMemory(formDataOrPayload, activePatientId);
      }
    } else {
      const payload = { ...formDataOrPayload };
      if (activePatientId) payload.patientId = activePatientId;
      if (memoryId) {
        res = await memoriesApi.updateMemory(memoryId, payload, activePatientId);
      } else {
        res = await memoriesApi.createMemory(payload, activePatientId);
      }
    }

    if (memoryId && res?.data) {
      if (selectedMemory && selectedMemory._id === memoryId) {
        setSelectedMemory(res.data);
      }
    }
    setCreateEditModalOpen(false);
    setMemoryToEdit(null);
    await fetchMemories();
  };

  const handleDeleteMemory = async (memoryId) => {
    await memoriesApi.deleteMemory(memoryId, activePatientId);
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
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-memora-accent mb-1">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Vault</span>
          </div>
          <h1 className="text-3xl font-black text-memora-text tracking-tight">My Memories</h1>
          <p className="text-sm text-memora-text-muted mt-1">
            Revisit your cherished moments, people, places, and stories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFamilyDirOpen(true)}
            className="px-4 py-3 bg-memora-surface-secondary hover:bg-memora-surface-hover text-emerald-400 font-bold text-sm rounded-2xl border border-memora-border flex items-center space-x-2 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Family Directory</span>
          </button>

          <button
            onClick={() => {
              setMemoryToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-5 py-3 bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search + Category Filters + Sort */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-4 shadow-lg space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-memora-text-subtle absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your memories by word, name, or place..."
            className="w-full pl-12 pr-10 py-3.5 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text font-medium text-base focus:outline-none focus:border-memora-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-memora-text-muted hover:text-memora-text font-bold text-xs bg-memora-surface px-2 py-1 rounded-md"
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
                    ? 'bg-memora-accent text-memora-bg font-black shadow-md'
                    : 'bg-memora-surface-secondary border border-memora-border text-memora-text-muted hover:text-memora-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-memora-text-subtle" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-memora-surface-secondary border border-memora-border text-memora-text text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-memora-accent"
            >
              <option value="-createdAt">Newest Added First</option>
              <option value="createdAt">Oldest Added First</option>
              <option value="-importantDate">Memory Date (Newest)</option>
              <option value="importantDate">Memory Date (Oldest)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-memora-accent animate-spin mx-auto mb-3" />
          <p className="text-memora-text font-bold text-lg">Loading your memories...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-memora-surface border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-memora-text mb-1">We Couldn't Load Your Memories</h3>
            <p className="text-sm text-memora-text-muted">{errorMsg}</p>
          </div>
          <button
            onClick={fetchMemories}
            className="px-6 py-3 bg-memora-surface-secondary hover:bg-memora-surface-hover text-memora-text font-bold text-sm rounded-2xl border border-memora-border transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg space-y-4">
          <div className="w-20 h-20 bg-memora-accent/10 border border-memora-accent/20 rounded-full flex items-center justify-center mx-auto text-memora-accent">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-memora-text mb-2">No Memories Found</h3>
            <p className="text-memora-text-muted max-w-md mx-auto text-sm leading-relaxed">
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
            className="px-6 py-3.5 bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-extrabold text-base rounded-2xl shadow-lg inline-flex items-center space-x-2 transition-all touch-target-xl"
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
            <div className="bg-memora-surface border border-memora-border rounded-2xl p-4 flex items-center justify-between text-sm">
              <span className="text-memora-text-muted text-xs font-bold">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-memora-surface-secondary border border-memora-border disabled:opacity-40 rounded-xl text-memora-text font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 bg-memora-surface-secondary border border-memora-border disabled:opacity-40 rounded-xl text-memora-text font-bold"
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
