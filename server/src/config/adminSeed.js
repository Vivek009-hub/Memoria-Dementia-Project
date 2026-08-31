/**
 * adminSeed.js — Initial Admin Account Auto-Seeder
 *
 * Seeds initial administrator account if ADMIN_EMAIL & ADMIN_PASSWORD env vars are set
 * and no admin exists.
 */

import bcrypt from 'bcryptjs';
import User from '../modules/users/user.model.js';
import logger from '../utils/logger.js';

export async function seedInitialAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  try {
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      return;
    }

    const email = adminEmail.toLowerCase().trim();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = 'ADMIN';
      existingUser.isActive = true;
      await existingUser.save();
      logger.info(`Promoted existing user ${email} to ADMIN role.`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'System Administrator',
        email,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      });
      logger.info(`Seeded initial admin account for ${email}.`);
    }
  } catch (err) {
    logger.error('Failed to seed initial admin account:', err);
  }
}
