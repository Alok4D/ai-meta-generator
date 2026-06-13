import express from 'express';
import { getOverviewStats, getAllUsers, updateUser, deleteUser, getAllSupportMessages, updateSupportMessageStatus } from './admin.controller';
import { protect, admin } from '../../middlewares/auth';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/overview', getOverviewStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/support', getAllSupportMessages);
router.patch('/support/:id/status', updateSupportMessageStatus);

export default router;
