/**
 * emergencyContacts.service.js — Emergency contact business logic
 */

import mongoose from 'mongoose';
import EmergencyContact from '../caregivers/emergencyContact.model.js';
import { AppError } from '../../utils/AppError.js';

/**
 * List all active emergency contacts for a patient.
 * @param {string} patientId
 * @returns {Promise<object[]>}
 */
export async function listContacts(patientId) {
  const contacts = await EmergencyContact.find({ patientId, isActive: true }).sort({
    priority: 1,
    createdAt: 1,
  });
  return contacts.map(formatContact);
}

/**
 * Create a new emergency contact for a patient.
 * @param {string} patientId
 * @param {string} createdBy - req.user.id
 * @param {object} data - Validated contact data
 * @returns {Promise<object>}
 */
export async function createContact(patientId, createdBy, data) {
  const contact = await EmergencyContact.create({
    patientId,
    createdBy,
    ...data,
  });
  return formatContact(contact);
}

/**
 * Update an emergency contact. Verifies ownership (contact must belong to patientId).
 * @param {string} contactId
 * @param {string} patientId - Used to verify the contact belongs to this patient
 * @param {object} data - Validated update data
 * @returns {Promise<object>}
 */
export async function updateContact(contactId, patientId, data) {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw new AppError('Invalid contact ID', 400, 'INVALID_ID');
  }

  const contact = await EmergencyContact.findOneAndUpdate(
    { _id: contactId, patientId, isActive: true },
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  );

  if (!contact) {
    throw new AppError('Emergency contact not found', 404, 'NOT_FOUND');
  }

  return formatContact(contact);
}

/**
 * Soft-delete an emergency contact (sets isActive: false).
 * Verifies ownership.
 * @param {string} contactId
 * @param {string} patientId
 */
export async function deleteContact(contactId, patientId) {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw new AppError('Invalid contact ID', 400, 'INVALID_ID');
  }

  const contact = await EmergencyContact.findOneAndUpdate(
    { _id: contactId, patientId, isActive: true },
    { $set: { isActive: false } },
    { returnDocument: 'after' }
  );

  if (!contact) {
    throw new AppError('Emergency contact not found', 404, 'NOT_FOUND');
  }
}

/**
 * Format an EmergencyContact Mongoose document into a plain object.
 * Phone numbers and emails are sensitive — not logged.
 */
function formatContact(doc) {
  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    name: doc.name,
    relationship: doc.relationship ?? null,
    phoneNumber: doc.phoneNumber ?? null,
    email: doc.email ?? null,
    priority: doc.priority,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
