import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage, getHistory, deleteHistory, regenerateMetadata } from './upload.controller';
import { protect } from '../../middlewares/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'uploads/');
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', protect, upload.single('image'), uploadImage);
router.get('/history', protect, getHistory);
router.delete('/history/:id', protect, deleteHistory);
router.post('/regenerate', protect, regenerateMetadata);

export default router;
