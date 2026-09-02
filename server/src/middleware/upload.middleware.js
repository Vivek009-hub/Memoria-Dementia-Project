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

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/3gpp',
]);

const MIME_EXT_MAP = {
  'audio/webm': '.webm',
  'audio/mp4': '.mp4',
  'audio/m4a': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/aac': '.aac',
  'audio/3gpp': '.3gp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || ext === '.blob') {
      const mimeBase = file.mimetype.split(';')[0].toLowerCase();
      ext = MIME_EXT_MAP[mimeBase] || (file.mimetype.startsWith('audio/') ? '.webm' : '.jpg');
    }
    cb(null, `${timestamp}-${randomHex}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const mimeBase = file.mimetype.split(';')[0].toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase()) || ALLOWED_MIME_TYPES.has(mimeBase)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only image files (JPEG, PNG, WEBP, GIF) and audio notes (WEBM, MP4, WAV, OGG, MP3) are allowed',
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
    fileSize: 20 * 1024 * 1024, // 20 MB limit
  },
});

export const uploadMemoryMedia = uploadMemoryPhoto;
