import express from 'express';
import multer from 'multer';
import path from 'path';
import { registerUser, loginUser, getMe, googleLogin, updatePassword, forgotPassword, resetPassword, updateProfile, verifyOtp, verifyOTP, resendOtp, claimWelcomeBonus } from './auth.controller';
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

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-reset-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/claim-bonus', protect, claimWelcomeBonus);

export default router;
