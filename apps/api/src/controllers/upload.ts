import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import fs from 'fs';
import MetaData from '../models/MetaData';
import User from '../models/User';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user || user.credits <= 0) {
      res.status(403).json({ error: 'Not enough credits' });
      return;
    }

    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ai-meta-generator',
    });

    // Remove local file
    fs.unlinkSync(req.file.path);

    // 2. Process with OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and generate strict JSON output with no markdown blocks or extra text. Format: { \"title\": \"SEO friendly title\", \"category\": \"Relevant category\", \"keywords\": [\"keyword1\", \"keyword2\", ..., \"keyword49\"] }." },
            {
              type: "image_url",
              image_url: {
                url: result.secure_url,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const aiResponse = response.choices[0].message.content || '{}';
    let metadata;
    try {
      metadata = JSON.parse(aiResponse);
    } catch (e) {
      // fallback parsing if surrounded by ```json ... ```
      const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      metadata = JSON.parse(cleaned);
    }

    // 3. Save to MongoDB
    const metaDataDoc = await MetaData.create({
      user: user._id,
      imageUrl: result.secure_url,
      title: metadata.title,
      category: metadata.category,
      keywords: metadata.keywords,
    });

    // 4. Deduct credit
    user.credits -= 1;
    await user.save();

    res.status(200).json({
      metadata: metaDataDoc,
      creditsRemaining: user.credits
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await MetaData.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
