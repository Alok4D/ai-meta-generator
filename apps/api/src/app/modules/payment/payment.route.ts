import { Router } from 'express';
import { createCheckoutSession, handleWebhook, getUserTransactions, getAllTransactions, verifyCheckoutSession } from './payment.controller';
import { protect, admin } from '../../middlewares/auth';

const router = Router();

// Public webhook route
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifyCheckoutSession);
router.get('/history', protect, getUserTransactions);

// Admin routes
router.get('/all', protect, admin, getAllTransactions);

export default router;
