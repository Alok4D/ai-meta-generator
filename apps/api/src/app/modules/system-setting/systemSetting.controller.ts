import { Request, Response } from 'express';
import crypto from 'crypto';
import SystemSetting from './systemSetting.model';

const MAGIC_WORD_KEY = 'apify_system_magic_word';

async function getEffectiveMagicWord(): Promise<{
  magicWord: string;
  updatedAt: Date | null;
  source: 'database' | 'env' | 'none';
}> {
  const doc = await SystemSetting.findOne({ key: MAGIC_WORD_KEY }).lean();
  if (doc && doc.value?.trim()) {
    return {
      magicWord: doc.value.trim(),
      updatedAt: doc.updatedAt || null,
      source: 'database',
    };
  }
  const envVal = process.env.APIFY_SYSTEM_MAGIC_WORD?.trim() || '';
  if (envVal) {
    return {
      magicWord: envVal,
      updatedAt: null,
      source: 'env',
    };
  }
  return { magicWord: '', updatedAt: null, source: 'none' };
}

function signMagicWordToken(magicWord: string): string {
  const secret = process.env.JWT_SECRET?.trim() || magicWord;
  return crypto
    .createHmac('sha256', secret)
    .update(`nx-apify-system:${magicWord}`)
    .digest('hex');
}

export const unlockApifySystem = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = typeof req.body?.magicWord === 'string' ? req.body.magicWord.trim() : '';
    const { magicWord: expected } = await getEffectiveMagicWord();

    if (!expected) {
      res.status(403).json({
        unlocked: false,
        error: 'System magic word is not configured by the admin yet.',
      });
      return;
    }

    if (!input) {
      res.status(400).json({
        unlocked: false,
        error: 'Please enter the magic word.',
      });
      return;
    }

    const inputBuf = Buffer.from(input, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const isMatch =
      inputBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(inputBuf, expectedBuf);

    if (!isMatch) {
      res.status(401).json({
        unlocked: false,
        error: 'Invalid magic word. Please check and try again.',
      });
      return;
    }

    res.status(200).json({
      unlocked: true,
      accessToken: signMagicWordToken(expected),
    });
  } catch (error: any) {
    res.status(500).json({
      unlocked: false,
      error: error.message || 'Failed to verify magic word.',
    });
  }
};

export const verifyApifySystemToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = typeof req.body?.accessToken === 'string' ? req.body.accessToken.trim() : '';
    const { magicWord: expected } = await getEffectiveMagicWord();

    if (!expected || !token) {
      res.status(200).json({ valid: false });
      return;
    }

    const expectedToken = signMagicWordToken(expected);
    const expectedBuf = Buffer.from(expectedToken, 'utf8');
    const actualBuf = Buffer.from(token, 'utf8');
    const valid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    res.status(200).json({ valid });
  } catch {
    res.status(200).json({ valid: false });
  }
};

export const getAdminMagicWord = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getEffectiveMagicWord();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load magic word.' });
  }
};

export const updateAdminMagicWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = typeof req.body?.magicWord === 'string' ? req.body.magicWord.trim() : '';
    if (!raw || raw.length < 3) {
      res.status(400).json({ error: 'Magic word must be at least 3 characters long.' });
      return;
    }

    const updated = await SystemSetting.findOneAndUpdate(
      { key: MAGIC_WORD_KEY },
      {
        key: MAGIC_WORD_KEY,
        value: raw,
        updatedBy: req.user?._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      magicWord: updated.value,
      updatedAt: updated.updatedAt,
      source: 'database',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update magic word.' });
  }
};
