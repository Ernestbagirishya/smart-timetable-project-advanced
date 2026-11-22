// backend/src/utils/upload.ts
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.mp4', '.avi', '.mov', '.jpg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, PPT, TXT, MP4, JPG, PNG'));
  }
};

// Create multer instance with better error handling
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Helper function
export const getFileTypeFromExtension = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'PDF';
    case '.doc': case '.docx': return 'DOCUMENT';
    case '.ppt': case '.pptx': return 'SLIDES';
    case '.mp4': case '.avi': case '.mov': return 'VIDEO';
    case '.jpg': case '.png': case '.jpeg': return 'IMAGE';
    default: return 'OTHER';
  }
};