import express from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from './subscription.controller';
import { protect, admin } from '../../middlewares/auth';

const router = express.Router();

router.get('/', getPlans); // Public or protected depending on where pricing page is. Let's make it public so landing page can use it, or protect it. For now, public.

// Admin routes
router.post('/', protect, admin, createPlan);
router.put('/:id', protect, admin, updatePlan);
router.delete('/:id', protect, admin, deletePlan);

export default router;
