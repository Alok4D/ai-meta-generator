import { Router } from 'express';
import { createCheckoutSession, handleWebhook, getUserTransactions, getAllTransactions, verifyCheckoutSession, cancelSubscription, submitManualPayment, getPendingManualPayments, verifyManualPayment, deleteTransaction } from './payment.controller';
import { protect, admin } from '../../middlewares/auth';

const router = Router();

// Public webhook route
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifyCheckoutSession);
router.get('/history', protect, getUserTransactions);
router.post('/cancel-subscription', protect, cancelSubscription);
router.post('/manual', protect, submitManualPayment);
router.delete('/:id', protect, deleteTransaction);

// Admin routes
router.get('/all', protect, admin, getAllTransactions);
router.get('/manual/pending', protect, admin, getPendingManualPayments);
router.post('/manual/verify', protect, admin, verifyManualPayment);

export default router;
