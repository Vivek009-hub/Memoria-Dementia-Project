import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import '../setup.js';
import EmergencyContact from '../../src/modules/caregivers/emergencyContact.model.js';

describe('EmergencyContact Model', () => {
  const validContactData = {
    patientId: new mongoose.Types.ObjectId(),
    name: 'Emergency Person',
    relationship: 'Spouse',
    phoneNumber: '+919876543210',
    email: 'emergency@example.com',
    priority: 1,
  };

  describe('valid creation', () => {
    it('creates a contact with valid data', async () => {
      const contact = await EmergencyContact.create(validContactData);
      expect(contact._id).toBeDefined();
      expect(contact.name).toBe('Emergency Person');
      expect(contact.relationship).toBe('Spouse');
      expect(contact.phoneNumber).toBe('+919876543210');
      expect(contact.email).toBe('emergency@example.com');
      expect(contact.priority).toBe(1);
      expect(contact.isActive).toBe(true);
      expect(contact.createdAt).toBeDefined();
    });

    it('creates a contact with minimal required fields', async () => {
      const contact = await EmergencyContact.create({
        patientId: new mongoose.Types.ObjectId(),
        name: 'Minimal Contact',
      });
      expect(contact.name).toBe('Minimal Contact');
      expect(contact.priority).toBe(1);
      expect(contact.isActive).toBe(true);
    });
  });

  describe('required patientId', () => {
    it('rejects contact without patientId', async () => {
      await expect(EmergencyContact.create({ name: 'No Patient' })).rejects.toThrow(
        'patientId is required'
      );
    });
  });

  describe('required name', () => {
    it('rejects contact without name', async () => {
      await expect(
        EmergencyContact.create({ patientId: new mongoose.Types.ObjectId() })
      ).rejects.toThrow('Contact name is required');
    });
  });

  describe('invalid data', () => {
    it('rejects priority below 1', async () => {
      await expect(EmergencyContact.create({ ...validContactData, priority: 0 })).rejects.toThrow(
        'Priority must be at least 1'
      );
    });

    it('rejects priority above 10', async () => {
      await expect(EmergencyContact.create({ ...validContactData, priority: 11 })).rejects.toThrow(
        'Priority cannot exceed 10'
      );
    });

    it('lowercases email', async () => {
      const contact = await EmergencyContact.create({
        ...validContactData,
        email: 'UPPER@EXAMPLE.COM',
      });
      expect(contact.email).toBe('upper@example.com');
    });
  });
});
