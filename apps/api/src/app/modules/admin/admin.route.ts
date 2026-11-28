import express from 'express';
import { getOverviewStats, getAnalyticsStats, getAllUsers, updateUser, deleteUser, getAllSupportMessages, updateSupportMessageStatus, getAllGenerations, getUserGenerationStats } from './admin.controller';
import {
  getAdminMagicWord,
  updateAdminMagicWord,
  getAdminSearchCacheTtl,
  updateAdminSearchCacheTtl,
} from '../system-setting/systemSetting.controller';
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

router.get('/magic-word', getAdminMagicWord);
router.put('/magic-word', updateAdminMagicWord);

router.get('/search-cache-ttl', getAdminSearchCacheTtl);
router.put('/search-cache-ttl', updateAdminSearchCacheTtl);

export default router;
