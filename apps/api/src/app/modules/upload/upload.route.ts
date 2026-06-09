import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage, getHistory } from './upload.controller';
import { protect } from '../../middlewares/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', protect, upload.single('image'), uploadImage);
router.get('/history', protect, getHistory);

export default router;
