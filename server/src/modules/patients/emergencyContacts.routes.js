/**
 * emergencyContacts.routes.js — Sub-router for emergency contacts
 *
 * This router is mounted at two points by patients.routes.js:
 *
 *   /patients/me/emergency-contacts          (patient self-access)
 *   /patients/:patientId/emergency-contacts  (authorized caregiver read)
 *
 * The mounting parent handles authentication and authorization.
 * This sub-router only handles parameter injection and CRUD dispatch.
 *
 * Parameter merging is enabled so :contactId is accessible alongside
 * :patientId from the parent router.
 */

import { Router } from 'express';
import * as ecController from './emergencyContacts.controller.js';

// mergeParams: true so we can access :patientId from the parent router
const router = Router({ mergeParams: true });

/**
 * Middleware: when mounted under /patients/me/..., inject patientId
 * from req.user so the controller can resolve it uniformly.
 * When mounted under /patients/:patientId/..., req.params.patientId
 * is already present (and authorization already ran).
 */
router.use((req, _res, next) => {
  if (!req.params.patientId && req.user) {
    req.patientId = req.user.id;
  }
  next();
});

// GET    /
router.get('/', ecController.listContacts);

// POST   /
router.post('/', ecController.createContact);

// PATCH  /:contactId
router.patch('/:contactId', ecController.updateContact);

// DELETE /:contactId
router.delete('/:contactId', ecController.deleteContact);

export default router;
