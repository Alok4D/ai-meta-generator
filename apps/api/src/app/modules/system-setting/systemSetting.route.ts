import express from 'express';
import {
  unlockApifySystem,
  verifyApifySystemToken,
  getPublicSearchCacheTtl,
} from './systemSetting.controller';

const router = express.Router();

router.post('/apify-magic-word/unlock', unlockApifySystem);
router.post('/apify-magic-word/verify-token', verifyApifySystemToken);
router.get('/search-cache-ttl', getPublicSearchCacheTtl);

export default router;
