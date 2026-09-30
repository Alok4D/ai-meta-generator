import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadVideoAndGenerateMeta,
  regenerateVideoMetadata,
  getVideoHistory,
  deleteVideoHistoryItem
} from './video-upload.controller';
import { protect } from '../../middlewares/auth';

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.qt', '.mts', '.m2ts', '.ts'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, MOV, WEBM, AVI, MKV) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for video
  fileFilter: fileFilter
});

router.post('/', protect, upload.single('video'), uploadVideoAndGenerateMeta);
router.post('/regenerate', protect, regenerateVideoMetadata);
router.get('/history', protect, getVideoHistory);
router.delete('/history/:id', protect, deleteVideoHistoryItem);

export default router;
