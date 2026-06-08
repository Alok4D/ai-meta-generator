import express from 'express';
import { getOverviewStats, getAllUsers, updateUser } from '../controllers/admin';
import { protect, admin } from '../middlewares/auth';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/overview', getOverviewStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

export default router;
