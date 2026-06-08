import express from 'express';
import { registerUser, loginUser, getMe, googleLogin, updatePassword } from '../controllers/auth';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

export default router;
