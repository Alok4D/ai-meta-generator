import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import fs from 'fs';
import MetaData from './metaData.model';
import User from '../auth/user.model';

const ADOBE_CATEGORIES = ["Animals", "Buildings and Architecture", "Business", "Drinks", "The Environment", "States of Mind", "Food", "Graphic Resources", "Hobbies and Leisure", "Industry", "Landscapes", "Lifestyle", "People", "Plants and Flowers", "Culture and Religion", "Science", "Social Issues", "Sports", "Technology", "Transport", "Travel"];
const SHUTTERSTOCK_CATEGORIES = ["Abstract", "Animals/Wildlife", "Arts", "Backgrounds/Textures", "Beauty/Fashion", "Buildings/Landmarks", "Business/Finance", "Celebrities", "Education", "Food and drink", "Healthcare/Medical", "Holidays", "Industrial", "Interiors", "Miscellaneous", "Nature", "Objects", "Parks/Outdoor", "People", "Religion", "Science", "Signs/Symbols", "Sports/Recreation", "Technology", "Transportation", "Vintage"];

const smartTrim = (text: string, maxLength: number) => {
  if (!text) return text;
  if (text.length <= maxLength) return text;
  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return lastSpace > 0 ? trimmed.substring(0, lastSpace).trim() : trimmed;
};

const getTargetLengthRule = (length: number, isShutterstock: boolean) => {
  const minLength = isShutterstock ? 50 : Math.max(20, length - 20);
  return `between ${minLength} and ${length} characters. Do NOT exceed ${length} characters.`;
};

const generatePrompt = (options: any, isRetry: boolean = false) => {
  const {
    platform = 'general',
    titleLength = 157,
    keywordCount = 41,
    negativeTitleWords = '',
    negativeKeywords = ''
  } = options;

  let negativeInstructions = '';
  if (negativeTitleWords) {
    negativeInstructions += `\nCRITICAL: Do NOT include these words in the title/description: ${negativeTitleWords}.`;
  }
  if (negativeKeywords) {
    negativeInstructions += `\nCRITICAL: Do NOT include these words in the keywords: ${negativeKeywords}.`;
  }

  const retryInstruction = isRetry ? `\nCRITICAL WARNING: Your previous attempt was TOO LONG. You MUST make the text strictly under ${titleLength} characters this time!\n` : '';

  if (platform === 'adobe') {
    return `You are a professional Adobe Stock metadata expert.
Analyze the image and return ONLY valid JSON.
Rules:
1. Generate an SEO-optimized title ${getTargetLengthRule(titleLength, false)}${retryInstruction}
2. Generate ${keywordCount} unique keywords.
3. Keywords must be highly relevant to the image.
4. Select EXACTLY ONE category from this list:
${ADOBE_CATEGORIES.join(', ')}
5. Never create your own category.
6. Return JSON only.
${negativeInstructions}

JSON Schema:
{
"title": "string",
"category": "string",
"keywords": ["string"]
}`;
  } else if (platform === 'shutterstock') {
    return `You are a professional Shutterstock metadata expert.
Analyze the image and return ONLY valid JSON.
Rules:
1. Generate a detailed description ${getTargetLengthRule(titleLength, true)}${retryInstruction}
2. Description must contain at least 5 words.
3. Generate ${keywordCount} unique keywords.
4. Select EXACTLY ONE category from the allowed Shutterstock categories:
${SHUTTERSTOCK_CATEGORIES.join(', ')}
5. Never create your own category.
6. Return JSON only.
${negativeInstructions}

JSON Schema:
{
"description": "string",
"category": "string",
"keywords": ["string"]
}`;
  }

  return `Analyze this image and return a JSON object with exactly three fields: 'title', 'category', and 'keywords'. Follow these rules:
1. 'title': An SEO optimized title, max ${titleLength} characters.${retryInstruction}
2. 'category': A single relevant category word.
3. 'keywords': An array of exactly ${keywordCount} SEO-optimized strings. Rank them from most important to least important.
4. Ensure all titles and keywords are highly relevant to the image. Avoid trademarked names, brand names, copyrighted terms, and irrelevant keywords.
Do not include markdown formatting or extra text.${negativeInstructions}`;
};

const applyPrefixSuffix = (text: string, prefix: string, suffix: string) => {
  let finalText = text;
  if (prefix) finalText = `${prefix} ${finalText}`.trim();
  if (suffix) finalText = `${finalText} ${suffix}`.trim();
  return finalText;
};

const validatePlatformData = (metadata: any, options: any) => {
  const { platform, titleLength, keywordCount } = options;
  let isValid = true;
  
  if (platform === 'adobe') {
    if (metadata.title && metadata.title.length > titleLength) isValid = false;
    if (!ADOBE_CATEGORIES.includes(metadata.category)) metadata.category = ADOBE_CATEGORIES[0];
  } else if (platform === 'shutterstock') {
    if (metadata.description && metadata.description.length > titleLength) isValid = false;
    if (!SHUTTERSTOCK_CATEGORIES.includes(metadata.category)) metadata.category = SHUTTERSTOCK_CATEGORIES[0];
  } else {
    if (metadata.title && metadata.title.length > titleLength) isValid = false;
  }
  
  if (metadata.keywords && Array.isArray(metadata.keywords)) {
    metadata.keywords = metadata.keywords.slice(0, keywordCount);
  }
  
  return isValid;
};

const generateAndValidateMetadata = async (aiImageUrl: string, options: any) => {
  let openai: OpenAI;
  let modelName: string;

  if (process.env.GROK_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });
    modelName = process.env.TEXT_MODEL_BASIC || "grok-2-vision-1212";
  } else {
    const apiKey = process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash_on_startup';
    const isOpenRouter = apiKey.startsWith('sk-or-');
    
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Meta Generator",
      } : undefined,
    });
    modelName = isOpenRouter ? "openai/gpt-4o" : "gpt-4o";
  }

  let finalMetadata: any = null;
  let attempts = 0;
  let isValid = false;

  while (attempts < 2 && !isValid) {
    const isRetry = attempts > 0;
    const promptText = generatePrompt(options, isRetry);

    const response = await openai.chat.completions.create({
      model: modelName,
      response_format: process.env.GROK_API_KEY ? undefined : { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: aiImageUrl } },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const aiResponse = response.choices[0]?.message?.content || '{}';
    let metadata;
    try {
      metadata = JSON.parse(aiResponse);
    } catch (e) {
      const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      metadata = JSON.parse(cleaned);
    }

    isValid = validatePlatformData(metadata, options);
    finalMetadata = metadata;
    attempts++;
  }

  if (!isValid && finalMetadata) {
    if (options.platform === 'shutterstock' && finalMetadata.description) {
      finalMetadata.description = smartTrim(finalMetadata.description, options.titleLength);
    } else if (finalMetadata.title) {
      finalMetadata.title = smartTrim(finalMetadata.title, options.titleLength);
    }
  }

  if (options.platform === 'shutterstock') {
    finalMetadata.description = applyPrefixSuffix(finalMetadata.description || '', options.prefix, options.suffix);
  } else {
    finalMetadata.title = applyPrefixSuffix(finalMetadata.title || '', options.prefix, options.suffix);
  }

  return finalMetadata;
};

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

    const platform = req.body.platform || 'general';
    const titleLength = parseInt(req.body.titleLength) || 157;
    const keywordCount = parseInt(req.body.keywordCount) || 41;
    const prefix = req.body.prefix || '';
    const suffix = req.body.suffix || '';
    const negativeTitleWords = req.body.negativeTitleWords || '';
    const negativeKeywords = req.body.negativeKeywords || '';

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ai-meta-generator',
    });

    fs.unlinkSync(req.file.path);

    let aiImageUrl = result.secure_url;
    if (aiImageUrl.toLowerCase().endsWith('.eps') || aiImageUrl.toLowerCase().endsWith('.avif')) {
      aiImageUrl = aiImageUrl.substring(0, aiImageUrl.lastIndexOf('.')) + '.jpg';
    }

    const metadata = await generateAndValidateMetadata(aiImageUrl, {
      platform, titleLength, keywordCount, prefix, suffix, negativeTitleWords, negativeKeywords
    });

    const metaDataDoc = await MetaData.create({
      user: req.user?._id,
      imageUrl: aiImageUrl,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category || 'Miscellaneous',
      keywords: metadata.keywords || [],
      platform: platform
    });

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

export const deleteHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const historyItem = await MetaData.findOne({ _id: id, user: req.user?._id });
    
    if (!historyItem) {
      res.status(404).json({ error: 'History item not found' });
      return;
    }

    await MetaData.deleteOne({ _id: id });
    res.status(200).json({ message: 'History item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history item' });
  }
};

export const regenerateMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl, platform, titleLength, keywordCount, prefix, suffix, negativeTitleWords, negativeKeywords } = req.body;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user || user.credits < 2) {
      res.status(403).json({ error: 'Not enough credits. Regenerating costs 2 credits.' });
      return;
    }

    const metadata = await generateAndValidateMetadata(imageUrl, {
      platform, titleLength, keywordCount, prefix, suffix, negativeTitleWords, negativeKeywords
    });

    const metaDataDoc = await MetaData.create({
      user: req.user?._id,
      imageUrl: imageUrl, 
      title: metadata.title,
      description: metadata.description,
      category: metadata.category || 'Miscellaneous',
      keywords: metadata.keywords || [],
      platform: platform
    });

    user.credits -= 2;
    await user.save();

    res.status(200).json({
      metadata: metaDataDoc,
      creditsRemaining: user.credits
    });
  } catch (error: any) {
    console.error('Regenerate Error:', error);
    res.status(500).json({ error: 'Failed to regenerate metadata' });
  }
};
