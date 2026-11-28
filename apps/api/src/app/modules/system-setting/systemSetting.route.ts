import express from 'express';
import { unlockApifySystem, verifyApifySystemToken } from './systemSetting.controller';

const router = express.Router();

router.post('/apify-magic-word/unlock', unlockApifySystem);
router.post('/apify-magic-word/verify-token', verifyApifySystemToken);

export default router;
