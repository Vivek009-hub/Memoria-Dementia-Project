import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  UserCheck,
  UserPlus,
  Key,
  Trash2,
  Edit2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Lock,
  Globe,
  Calendar,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  getPatientProfile,
  updatePatientProfile,
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getPatientCaregivers,
  generateCaregiverInvite,
  acceptCaregiverRequest,
  updateCaregiverPermissions,
  revokeCaregiverConnection,
} from '../api/patientsApi.js';
import { fetchCurrentLocation } from '../api/safetyApi.js';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LanguageSelector } from '../components/common/LanguageSelector.jsx';

export function PatientProfilePage() {
  // State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Profile Edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', preferredLanguage: 'en', dateOfBirth: '' });

  // Location
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Emergency Contacts
  const [contacts, setContacts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', relationship: '', phoneNumber: '', priority: 1 });

  // Caregivers & Pairing
  const [caregivers, setCaregivers] = useState([]);
  const [activeInvite, setActiveInvite] = useState(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profRes, contactsRes, caregiversRes, locRes] = await Promise.allSettled([
        getPatientProfile(),
        getEmergencyContacts(),
        getPatientCaregivers(),
        fetchCurrentLocation(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.success) {
        const p = profRes.value.data.patient;
        setProfile(p);
        setEditForm({
          name: p.name || '',
          phone: p.phone || '',
          preferredLanguage: p.preferredLanguage || 'en',
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
        });
      }

      if (contactsRes.status === 'fulfilled' && contactsRes.value.success) {
        setContacts(contactsRes.value.data.contacts || []);
      }

      if (caregiversRes.status === 'fulfilled' && caregiversRes.value.success) {
        setCaregivers(caregiversRes.value.data.relationships || []);
      }

      if (locRes.status === 'fulfilled' && locRes.value.success) {
        setLocation(locRes.value.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updatePatientProfile(editForm);
      if (res.success) {
        setProfile(res.data.patient);
        setIsEditingProfile(false);
        showFeedback('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  // 2. Location Sharing Toggle
  const handleToggleLocationSharing = async () => {
    if (!profile) return;
    const nextVal = !profile.safetySettings?.locationSharingEnabled;
    try {
      const res = await updatePatientProfile({
        safetySettings: { ...profile.safetySettings, locationSharingEnabled: nextVal },
      });
      if (res.success) {
        setProfile(res.data.patient);
        showFeedback(`Location sharing ${nextVal ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update location sharing setting');
    }
  };

  // Refresh Location
  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    try {
      const res = await fetchCurrentLocation();
      if (res.success) setLocation(res.data);
    } catch {
      // ignore
    } finally {
      setLocationLoading(false);
    }
  };

  // 3. Emergency Contacts CRUD
  const handleOpenContactModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name,
        relationship: contact.relationship || '',
        phoneNumber: contact.phoneNumber || '',
        priority: contact.priority || 1,
      });
    } else {
      setEditingContact(null);
      setContactForm({ name: '', relationship: '', phoneNumber: '', priority: 1 });
    }
    setShowContactModal(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        const res = await updateEmergencyContact(editingContact.id, contactForm);
        if (res.success) {
          showFeedback('Emergency contact updated');
          setShowContactModal(false);
          const fresh = await getEmergencyContacts();
          if (fresh.success) setContacts(fresh.data.contacts || []);
        }
      } else {
        const res = await addEmergencyContact(contactForm);
        if (res.success) {
          showFeedback('Emergency contact added');
          setShowContactModal(false);
          const fresh = await getEmergencyContacts();
          if (fresh.success) setContacts(fresh.data.contacts || []);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save emergency contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact?')) return;
    try {
      const res = await deleteEmergencyContact(contactId);
      if (res.success) {
        showFeedback('Contact deleted');
        setContacts(contacts.filter((c) => c.id !== contactId));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete contact');
    }
  };

  // 4. Caregiver Connections & Invitations
  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const res = await generateCaregiverInvite({ relationshipType: 'FAMILY' });
      if (res.success) {
        setActiveInvite(res.data.invitation);
        showFeedback('Pairing code generated! Share code with your caregiver.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate invitation code');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleAcceptCaregiver = async (relationshipId) => {
    try {
      const res = await acceptCaregiverRequest(relationshipId);
      if (res.success) {
        showFeedback('Caregiver request accepted!');
        const fresh = await getPatientCaregivers();
        if (fresh.success) setCaregivers(fresh.data.relationships || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to accept caregiver request');
    }
  };

  const handleRevokeCaregiver = async (relationshipId) => {
    if (!window.confirm('Are you sure you want to disconnect this caregiver? They will immediately lose access.')) return;
    try {
      const res = await revokeCaregiverConnection(relationshipId);
      if (res.success) {
        showFeedback('Caregiver connection revoked');
        const fresh = await getPatientCaregivers();
        if (fresh.success) setCaregivers(fresh.data.relationships || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to revoke connection');
    }
  };

  // 5. Sharing Permission Toggle
  const handleTogglePermission = async (relationshipId, key, currentVal) => {
    const activeRel = caregivers.find((r) => r.id === relationshipId);
    if (!activeRel) return;
    const newPerms = { ...activeRel.permissions, [key]: !currentVal };
    try {
      const res = await updateCaregiverPermissions(relationshipId, newPerms);
      if (res.success) {
        showFeedback('Sharing permission updated');
        setCaregivers(
          caregivers.map((r) => (r.id === relationshipId ? res.data.relationship : r))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to update permission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin" />
      </div>
    );
  }

  const activeCaregivers = caregivers.filter((c) => c.status === 'ACTIVE');
  const pendingCaregivers = caregivers.filter((c) => c.status === 'PENDING');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#202020] p-6 rounded-xl border border-[#343434]">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-[#D8B24C]/10 border border-[#D8B24C]/30 flex items-center justify-center text-[#D8B24C]">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#F5F5F0] tracking-tight">{profile?.name || 'Patient Profile'}</h1>
            <p className="text-[#A7A7A2] text-sm">{profile?.email || 'Manage personal & safety details'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={activeCaregivers.length > 0 ? 'success' : 'warning'}>
            {activeCaregivers.length > 0 ? `${activeCaregivers.length} Caregiver Connected` : 'No Active Caregiver'}
          </Badge>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="flex items-center space-x-2 bg-[#45B982]/10 border border-[#45B982]/30 text-[#45B982] px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 bg-[#D95C5C]/10 border border-[#D95C5C]/30 text-[#D95C5C] px-4 py-3 rounded-lg text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-[#D95C5C] hover:text-[#F5F5F0]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid Section 1 & 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#343434] pb-3">
            <div className="flex items-center space-x-2 text-[#F5F5F0] font-semibold text-base">
              <User className="w-5 h-5 text-[#D8B24C]" />
              <span>Personal Information</span>
            </div>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Preferred Language
                </label>
                <LanguageSelector variant="dropdown" className="w-full" />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary" size="sm">
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm pt-2">
              <div className="flex items-center justify-between py-2 border-b border-[#343434]">
                <span className="text-[#A7A7A2] flex items-center"><User className="w-4 h-4 mr-2 text-[#74746F]" /> Name</span>
                <span className="text-[#F5F5F0] font-semibold">{profile?.name || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#343434]">
                <span className="text-[#A7A7A2] flex items-center"><Mail className="w-4 h-4 mr-2 text-[#74746F]" /> Email</span>
                <span className="text-[#F5F5F0] font-semibold">{profile?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#343434]">
                <span className="text-[#A7A7A2] flex items-center"><Phone className="w-4 h-4 mr-2 text-[#74746F]" /> Phone</span>
                <span className="text-[#F5F5F0] font-semibold">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#343434]">
                <span className="text-[#A7A7A2] flex items-center"><Globe className="w-4 h-4 mr-2 text-[#74746F]" /> Language</span>
                <span className="text-[#F5F5F0] font-semibold uppercase">{profile?.preferredLanguage || 'en'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#A7A7A2] flex items-center"><Calendar className="w-4 h-4 mr-2 text-[#74746F]" /> Date of Birth</span>
                <span className="text-[#F5F5F0] font-semibold">
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* My Location & Sharing */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#343434] pb-3">
            <div className="flex items-center space-x-2 text-[#F5F5F0] font-semibold text-base">
              <MapPin className="w-5 h-5 text-[#45B982]" />
              <span>Location & Safety</span>
            </div>
            <button
              onClick={handleRefreshLocation}
              disabled={locationLoading}
              className="p-1.5 rounded-lg bg-[#151515] border border-[#343434] hover:bg-[#242424] text-[#A7A7A2] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin text-[#D8B24C]' : ''}`} />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* Location Status Card */}
            <div className="bg-[#151515] p-4 rounded-xl border border-[#343434] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider">
                  Location Status
                </span>
                <Badge variant={location?.isStale ? 'warning' : location ? 'success' : 'neutral'}>
                  {location?.isStale ? 'Last Known Location' : location ? 'Current Location' : 'No Signal'}
                </Badge>
              </div>

              {location ? (
                <div className="space-y-1.5">
                  <div className="text-[#F5F5F0] font-medium text-sm flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#D8B24C] shrink-0" />
                    <span>{location.latitude?.toFixed(4)}°, {location.longitude?.toFixed(4)}°</span>
                  </div>
                  <div className="text-[#A7A7A2] text-xs flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-[#74746F]" />
                    <span>Last Updated: {new Date(location.timestamp || location.createdAt).toLocaleTimeString()} ({location.isStale ? 'Stale' : 'Live'})</span>
                  </div>
                </div>
              ) : (
                <p className="text-[#74746F] text-xs italic">No geolocation fixes received recently.</p>
              )}
            </div>

            {/* Location Sharing Switch */}
            <div className="flex items-center justify-between p-4 bg-[#151515] rounded-xl border border-[#343434]">
              <div>
                <h4 className="text-sm font-semibold text-[#F5F5F0]">Location Sharing to Caregiver</h4>
                <p className="text-xs text-[#A7A7A2]">Allow active caregiver to view location</p>
              </div>
              <button
                onClick={handleToggleLocationSharing}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  profile?.safetySettings?.locationSharingEnabled ? 'bg-[#45B982] justify-end' : 'bg-[#343434] justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#151515] shadow-xs" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency Contacts Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#343434] pb-3">
          <div className="flex items-center space-x-2 text-[#F5F5F0] font-semibold text-base">
            <Phone className="w-5 h-5 text-[#D95C5C]" />
            <span>Emergency Contacts</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => handleOpenContactModal()}>
            <Plus className="w-4 h-4 mr-1" /> Add Contact
          </Button>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-8 bg-[#151515] rounded-xl border border-[#343434]">
            <AlertCircle className="w-8 h-8 text-[#74746F] mx-auto mb-2" />
            <p className="text-[#A7A7A2] text-sm font-medium">No emergency contacts added yet.</p>
            <p className="text-[#74746F] text-xs mt-1">Add trusted contacts who can be reached in emergency events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {contacts.map((contact) => (
              <div
                key={contact.id || contact._id}
                className="bg-[#151515] p-4 rounded-xl border border-[#343434] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#F5F5F0] text-base">{contact.name}</h4>
                    <Badge variant="neutral">Priority {contact.priority || 1}</Badge>
                  </div>
                  <p className="text-[#A7A7A2] text-xs mt-0.5">{contact.relationship || 'Contact'}</p>
                  <p className="text-[#F5F5F0] text-sm font-mono mt-2 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-[#74746F]" />
                    {contact.phoneNumber || 'No phone'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-[#343434]">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleOpenContactModal(contact)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <button
                    onClick={() => handleDeleteContact(contact.id || contact._id)}
                    className="p-2 text-[#A7A7A2] hover:text-[#D95C5C] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Caregiver Connection & Pairing */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#343434] pb-3">
          <div className="flex items-center space-x-2 text-[#F5F5F0] font-semibold text-base">
            <UserCheck className="w-5 h-5 text-[#D8B24C]" />
            <span>Caregiver Connection & Pairing</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerateInvite}
            disabled={generatingInvite}
          >
            <Key className="w-4 h-4 mr-1" /> Generate Pairing Code
          </Button>
        </div>

        {/* Pairing Code Card if active */}
        {activeInvite && (
          <div className="bg-[#D8B24C]/10 border border-[#D8B24C]/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#D8B24C] uppercase tracking-wider flex items-center">
                <Key className="w-4 h-4 mr-1.5" /> Pairing Code Created
              </span>
              <p className="text-[#A7A7A2] text-xs">Share this 6-character code with your caregiver to connect accounts.</p>
            </div>
            <div className="flex items-center space-x-3 bg-[#151515] px-6 py-3 rounded-xl border border-[#D8B24C]/40">
              <span className="text-2xl font-bold text-[#D8B24C] tracking-widest font-mono">{activeInvite.inviteCode}</span>
            </div>
          </div>
        )}

        {/* Pending Caregivers / Invitations */}
        {pendingCaregivers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider">Pending Caregiver Requests</h4>
            <div className="space-y-2">
              {pendingCaregivers.map((rel) => (
                <div key={rel.id} className="bg-[#151515] p-4 rounded-xl border border-[#E5A83B]/30 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-[#F5F5F0]">{rel.caregiver?.name || 'Caregiver Request'}</h5>
                    <p className="text-xs text-[#A7A7A2]">{rel.caregiver?.email || 'Pending approval'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="primary" size="sm" onClick={() => handleAcceptCaregiver(rel.id)}>
                      Accept Connection
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleRevokeCaregiver(rel.id)}>
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Caregivers List */}
        {activeCaregivers.length === 0 ? (
          <div className="text-center py-6 bg-[#151515] rounded-xl border border-[#343434]">
            <UserPlus className="w-8 h-8 text-[#74746F] mx-auto mb-2" />
            <p className="text-[#A7A7A2] text-sm font-medium">No active caregiver connected.</p>
            <p className="text-[#74746F] text-xs mt-1">Click 'Generate Pairing Code' above to connect with a family caregiver.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider">Connected Caregivers</h4>
            {activeCaregivers.map((rel) => (
              <div key={rel.id} className="bg-[#151515] p-5 rounded-xl border border-[#343434] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#343434] pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D8B24C]/10 text-[#D8B24C] flex items-center justify-center font-bold border border-[#D8B24C]/30">
                      {rel.caregiver?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#F5F5F0] text-base">{rel.caregiver?.name || 'Caregiver Account'}</h4>
                      <p className="text-[#A7A7A2] text-xs">{rel.caregiver?.email} &bull; {rel.relationshipType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">CONNECTED</Badge>
                    <Button variant="secondary" size="sm" onClick={() => handleRevokeCaregiver(rel.id)}>
                      Disconnect
                    </Button>
                  </div>
                </div>

                {/* Privacy & Sharing Controls */}
                <div>
                  <h5 className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider mb-3 flex items-center">
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-[#D8B24C]" /> Caregiver Sharing Permissions
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'viewProfile', label: 'Basic Profile' },
                      { key: 'viewLocation', label: 'Location Sharing' },
                      { key: 'manageReminders', label: 'Reminders' },
                      { key: 'manageMemories', label: 'Memories' },
                      { key: 'viewCognitiveActivity', label: 'Game Progress' },
                      { key: 'receiveSafetyAlerts', label: 'Safety Alerts' },
                    ].map((perm) => {
                      const enabled = !!rel.permissions?.[perm.key];
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => handleTogglePermission(rel.id, perm.key, enabled)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                            enabled
                              ? 'bg-[#D8B24C]/10 border-[#D8B24C]/30 text-[#D8B24C]'
                              : 'bg-[#202020] border-[#343434] text-[#74746F] hover:border-[#343434]'
                          }`}
                        >
                          <span>{perm.label}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-[#D8B24C]' : 'bg-[#343434]'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Contact Form Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#202020] border border-[#343434] p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#343434] pb-3">
              <h3 className="text-lg font-semibold text-[#F5F5F0]">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button onClick={() => setShowContactModal(false)} className="text-[#A7A7A2] hover:text-[#F5F5F0]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                  placeholder="e.g. Daughter, Spouse, Doctor"
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={contactForm.phoneNumber}
                  onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-1">
                  Priority (1 = Highest)
                </label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm({ ...contactForm, priority: Number(e.target.value) })}
                  className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C] text-sm"
                >
                  <option value={1}>1 - Primary Emergency Contact</option>
                  <option value={2}>2 - Secondary Contact</option>
                  <option value={3}>3 - Tertiary Contact</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary" className="w-full">
                  {editingContact ? 'Save Contact' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
