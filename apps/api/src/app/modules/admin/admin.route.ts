import express from 'express';
import { getOverviewStats, getAnalyticsStats, getAllUsers, updateUser, deleteUser, getAllSupportMessages, updateSupportMessageStatus, getAllGenerations, getUserGenerationStats } from './admin.controller';
import { protect, admin } from '../../middlewares/auth';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/overview', getOverviewStats);
router.get('/analytics', getAnalyticsStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/images', getAllGenerations);
router.get('/generation-stats', getUserGenerationStats);

router.get('/support', getAllSupportMessages);
router.patch('/support/:id/status', updateSupportMessageStatus);

export default router;
