/**
 * seedAdmin.js — MongoDB Admin User Seeding Script
 *
 * Checks if an Admin user already exists in MongoDB.
 * If not, reads ADMIN_EMAIL and ADMIN_PASSWORD from .env and creates an ADMIN user.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import User from '../modules/users/user.model.js';

async function seedAdmin() {
  const adminEmail = (env.adminEmail || 'admin@memora.com').trim().toLowerCase();
  const adminPassword = env.adminPassword || 'Admin@123456';

  console.log('🔄 Connecting to MongoDB to check Admin account...');
  await mongoose.connect(env.mongoUri);

  try {
    // Check if an admin user already exists (by role or by configured email)
    let adminUser = await User.findOne({
      $or: [{ role: 'ADMIN' }, { email: adminEmail }],
    });

    if (adminUser) {
      if (adminUser.role !== 'ADMIN') {
        adminUser.role = 'ADMIN';
        await adminUser.save();
        console.log(`✅ Updated existing user "${adminUser.email}" to ADMIN role.`);
      } else {
        console.log(`ℹ️ Admin user already exists in MongoDB: "${adminUser.email}" (Role: ${adminUser.role})`);
      }
    } else {
      console.log(`🌱 No Admin user found. Creating new Admin user: "${adminEmail}"...`);
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      adminUser = await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        preferredLanguage: 'en',
      });

      console.log(`🎉 Admin user created successfully!`);
      console.log(`   Email:    ${adminUser.email}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role:     ${adminUser.role}`);
    }
  } catch (err) {
    console.error('❌ Error seeding Admin user:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedAdmin();
