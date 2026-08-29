import { describe, it, expect, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import '../setup.js';
import CaregiverRelationship from '../../src/modules/caregivers/caregiverRelationship.model.js';

describe('CaregiverRelationship Model', () => {
  beforeAll(async () => {
    await CaregiverRelationship.ensureIndexes();
  });

  const validRelationshipData = () => ({
    caregiverId: new mongoose.Types.ObjectId(),
    patientId: new mongoose.Types.ObjectId(),
    relationshipType: 'FAMILY',
    status: 'ACTIVE',
  });

  describe('valid creation', () => {
    it('creates a relationship with valid data', async () => {
      const data = validRelationshipData();
      const rel = await CaregiverRelationship.create(data);
      expect(rel._id).toBeDefined();
      expect(rel.caregiverId).toEqual(data.caregiverId);
      expect(rel.patientId).toEqual(data.patientId);
      expect(rel.relationshipType).toBe('FAMILY');
      expect(rel.status).toBe('ACTIVE');
      expect(rel.createdAt).toBeDefined();
    });

    it('has correct permission defaults', async () => {
      const rel = await CaregiverRelationship.create(validRelationshipData());
      expect(rel.permissions.viewProfile).toBe(true);
      expect(rel.permissions.manageMemories).toBe(false);
      expect(rel.permissions.manageReminders).toBe(false);
      expect(rel.permissions.viewCognitiveActivity).toBe(false);
      expect(rel.permissions.viewLocation).toBe(false);
      expect(rel.permissions.manageGeofences).toBe(false);
      expect(rel.permissions.receiveSafetyAlerts).toBe(false);
      expect(rel.permissions.manageCommunityRegistration).toBe(false);
    });

    it('defaults status to PENDING', async () => {
      const data = validRelationshipData();
      delete data.status;
      const rel = await CaregiverRelationship.create(data);
      expect(rel.status).toBe('PENDING');
    });
  });

  describe('invalid relationship type', () => {
    it('rejects invalid relationshipType', async () => {
      const data = { ...validRelationshipData(), relationshipType: 'FRIEND' };
      await expect(CaregiverRelationship.create(data)).rejects.toThrow(
        'is not a valid relationship type'
      );
    });
  });

  describe('invalid status', () => {
    it('rejects invalid status', async () => {
      const data = { ...validRelationshipData(), status: 'DELETED' };
      await expect(CaregiverRelationship.create(data)).rejects.toThrow('is not a valid status');
    });
  });

  describe('all valid relationship types', () => {
    it('accepts FAMILY, PROFESSIONAL, GUARDIAN, OTHER', async () => {
      const types = ['FAMILY', 'PROFESSIONAL', 'GUARDIAN', 'OTHER'];
      for (let i = 0; i < types.length; i++) {
        const data = {
          ...validRelationshipData(),
          caregiverId: new mongoose.Types.ObjectId(),
          patientId: new mongoose.Types.ObjectId(),
          relationshipType: types[i],
        };
        const rel = await CaregiverRelationship.create(data);
        expect(rel.relationshipType).toBe(types[i]);
      }
    });
  });

  describe('duplicate relationship prevention', () => {
    it('rejects duplicate active relationship for same caregiver-patient pair', async () => {
      const data = validRelationshipData();
      await CaregiverRelationship.create(data);
      await expect(CaregiverRelationship.create(data)).rejects.toThrow();
    });

    it('allows a REVOKED + new ACTIVE relationship for same pair', async () => {
      const data = validRelationshipData();
      data.status = 'REVOKED';
      await CaregiverRelationship.create(data);

      const newRel = await CaregiverRelationship.create({
        ...data,
        status: 'ACTIVE',
      });
      expect(newRel.status).toBe('ACTIVE');
    });
  });
});
