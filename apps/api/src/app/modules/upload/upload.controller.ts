import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import fs from 'fs';
import MetaData from './metaData.model';
import User from '../auth/user.model';


// Remove global instantiation

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

    // Configure cloudinary with env vars (which are available here)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ai-meta-generator',
    });

    // Remove local file
    fs.unlinkSync(req.file.path);

    // 2. Process with OpenAI Vision API (or OpenRouter)
    const apiKey = process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash_on_startup';
    const isOpenRouter = apiKey.startsWith('sk-or-');
    
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? {
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
        "X-Title": "AI Meta Generator", // Required by OpenRouter
      } : undefined,
    });

    const response = await openai.chat.completions.create({
      model: isOpenRouter ? "openai/gpt-4o" : "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and return a JSON object with exactly three fields: 'title' (a highly descriptive SEO friendly title), 'category' (a single relevant category word), and 'keywords' (an array of EXACTLY 49 highly relevant comma-separated keywords for stock photography). Do not include markdown formatting or extra text." },
            {
              type: "image_url",
              image_url: {
                url: result.secure_url,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content || '{}';
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
      user: req.user?._id,
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
