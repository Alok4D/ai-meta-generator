import express from 'express';
import path from 'path';
import { protect } from '../app/middlewares/auth';
import { forgotPassword, getMe, googleLogin, loginUser, registerUser, resetPassword, updatePassword, updateProfile } from '../app/modules/auth/auth.controller';
import multer = require('multer');


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

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
