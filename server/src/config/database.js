import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    throw error;
  }
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}
