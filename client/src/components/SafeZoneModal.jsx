/**
 * SafeZoneModal.jsx — Caregiver Safe Zone Creation & Editing Modal
 */

import React, { useState } from 'react';
import { MapPin, X, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import * as safetyApi from '../api/safety.api.js';

export function SafeZoneModal({
  isOpen,
  onClose,
  patientId,
  existingZone = null,
  onSuccess,
}) {
  const [name, setName] = useState(existingZone?.name || 'Home Safe Zone');
  const [lat, setLat] = useState(existingZone?.centerLatitude || 28.6139);
  const [lng, setLng] = useState(existingZone?.centerLongitude || 77.2090);
  const [radius, setRadius] = useState(existingZone?.radiusMeters || 200);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (radius < 50 || radius > 10000) {
      setErrorMsg('Radius must be between 50 meters and 10,000 meters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (existingZone?._id) {
        await safetyApi.updateGeofence(existingZone._id, {
          name,
          centerLatitude: Number(lat),
          centerLongitude: Number(lng),
          radiusMeters: Number(radius),
        });
      } else {
        await safetyApi.createGeofence({
          patientId,
          name,
          centerLatitude: Number(lat),
          centerLongitude: Number(lng),
          radiusMeters: Number(radius),
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save safe zone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-[#343434] p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#343434] pb-3">
          <div className="flex items-center space-x-2 text-[#F5F5F0]">
            <MapPin className="w-5 h-5 text-[#D8B24C]" />
            <h3 className="font-bold text-base">
              {existingZone ? 'Edit Safe Zone' : 'Create New Safe Zone'}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#A7A7A2] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#D95C5C]/10 border border-[#D95C5C]/30 text-[#D95C5C] text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#A7A7A2] font-semibold uppercase tracking-wider mb-1">
              Safe Zone Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home Boundary"
              className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A7A7A2] font-semibold uppercase tracking-wider mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3 py-2 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C]"
              />
            </div>
            <div>
              <label className="block text-[#A7A7A2] font-semibold uppercase tracking-wider mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-[#151515] border border-[#343434] rounded-lg px-3 py-2 text-[#F5F5F0] focus:outline-none focus:border-[#D8B24C]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#A7A7A2] font-semibold mb-1">
              <label className="uppercase tracking-wider">Radius (Meters)</label>
              <span className="text-[#D8B24C]">{radius} m</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-[#D8B24C]"
            />
            <span className="text-[10px] text-[#A7A7A2] block mt-1">
              Recommended: 100m - 500m for residential home zones.
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#D8B24C] hover:bg-[#E8C968] text-[#151515] font-bold text-sm rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Save Safe Zone</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
