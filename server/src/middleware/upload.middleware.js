/**
 * upload.middleware.js — Multer configuration for local memory photo uploads
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads/memories');

// Ensure upload directory exists synchronously on startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    // Clean filename: timestamp-randomHex.ext
    cb(null, `${timestamp}-${randomHex}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only image files (JPEG, PNG, WEBP, GIF) are allowed',
        422,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

export const uploadMemoryPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});
