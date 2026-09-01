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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-blue-600 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h3 className="font-black text-2xl text-slate-900">
              {existingZone ? 'Edit Safe Zone' : 'Create Safe Zone'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-2xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm font-semibold text-slate-700">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Safe Zone Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home Boundary"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
              <label>Radius (Meters)</label>
              <span className="text-blue-600 font-extrabold text-sm">{radius} m</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-500 block mt-1.5">
              Recommended: 100m - 500m for residential home zones.
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-base rounded-2xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
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
