import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import '../setup.js';
import PatientProfile from '../../src/modules/patients/patientProfile.model.js';

describe('PatientProfile Model', () => {
  const validProfileData = {
    userId: new mongoose.Types.ObjectId(),
  };

  describe('valid creation', () => {
    it('creates a profile with valid data', async () => {
      const profile = await PatientProfile.create(validProfileData);
      expect(profile._id).toBeDefined();
      expect(profile.userId).toEqual(validProfileData.userId);
      expect(profile.preferredLanguage).toBe('en');
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it('creates a profile with all fields', async () => {
      const profile = await PatientProfile.create({
        ...validProfileData,
        dateOfBirth: new Date('1950-01-15'),
        preferredLanguage: 'hi',
        accessibilitySettings: {
          largeText: true,
          highContrast: true,
          voiceEnabled: true,
          reducedMotion: true,
        },
        safetySettings: {
          locationSharingEnabled: true,
          fallDetectionEnabled: true,
          sosEnabled: true,
        },
      });
      expect(profile.dateOfBirth).toEqual(new Date('1950-01-15'));
      expect(profile.preferredLanguage).toBe('hi');
      expect(profile.accessibilitySettings.largeText).toBe(true);
      expect(profile.accessibilitySettings.highContrast).toBe(true);
      expect(profile.safetySettings.locationSharingEnabled).toBe(true);
    });

    it('has correct accessibility defaults', async () => {
      const profile = await PatientProfile.create(validProfileData);
      expect(profile.accessibilitySettings.largeText).toBe(false);
      expect(profile.accessibilitySettings.highContrast).toBe(false);
      expect(profile.accessibilitySettings.voiceEnabled).toBe(true);
      expect(profile.accessibilitySettings.reducedMotion).toBe(false);
    });

    it('has correct safety defaults', async () => {
      const profile = await PatientProfile.create(validProfileData);
      expect(profile.safetySettings.locationSharingEnabled).toBe(false);
      expect(profile.safetySettings.fallDetectionEnabled).toBe(false);
      expect(profile.safetySettings.sosEnabled).toBe(true);
    });
  });

  describe('required userId', () => {
    it('rejects profile without userId', async () => {
      await expect(PatientProfile.create({})).rejects.toThrow('userId is required');
    });
  });

  describe('duplicate userId prevention', () => {
    it('rejects duplicate userId', async () => {
      await PatientProfile.create(validProfileData);
      await expect(PatientProfile.create(validProfileData)).rejects.toThrow();
    });
  });
});
