import dns from 'node:dns';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { seedInitialAdmin } from './adminSeed.js';

// Use public DNS servers to resolve MongoDB SRV lookup issues on restricted local networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully');
    await seedInitialAdmin();
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    throw error;
  }
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}
