import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import VideoMetaData from './video-upload.model';
import User from '../auth/user.model';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateWithFallback = async (genAI: GoogleGenerativeAI, contents: any) => {
  const modelsToTry = [
    process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.6-flash'
  ];

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      return result;
    } catch (err: any) {
      console.warn(`Gemini Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
};

const getPlatformGuidance = (platform: string): string => {
  switch (platform) {
    case 'adobe':
      return `STRICT TARGET: ADOBE STOCK VIDEO
- Title should be concise, action-focused (ideal 50-70 chars, max 200). DO NOT include technical buzzwords or specs like "4K", "HD", "60fps", "Slow Motion" in the title.
- Provide maximum 49 keywords. Adobe's search algorithm weights the FIRST 10 KEYWORDS most heavily, so place the top 10 most relevant commercial terms at the very beginning. All keywords MUST be single words.`;
    case 'pond5':
      return `STRICT TARGET: POND5 STOCK FOOTAGE
- Title should be descriptive (40-80 chars) and prioritize camera movement (e.g. Aerial drone, Gimbal tracking, Slow motion, Static tripod, Timelapse) and precise location.
- Keywords (10-50 tags) should include technical motion descriptions, camera styles, and commercial footage use cases.`;
    case 'shutterstock':
      return `STRICT TARGET: SHUTTERSTOCK FOOTAGE
- Title/Description (50-150 chars) MUST strictly follow the 5W formula: Who is in it, What is happening, Where it is located, When (time/lighting), and Why/Mood.
- Keywords (7-50 tags) must be highly descriptive commercial buyer-intent tags.`;
    case 'getty':
      return `STRICT TARGET: GETTY IMAGES / ISTOCK
- Concise, factually accurate title. Controlled vocabulary and concept-driven tagging focusing on human emotions, business metaphors, and authentic storytelling.`;
    case 'envato':
      return `STRICT TARGET: ENVATO (VIDEOHIVE / ELEMENTS)
- Action title (30-100 chars) tailored for video editors. Keywords should include usage tags (e.g. background, b-roll, overlay, loop, transition, intro, opener, promo).`;
    case 'artgrid':
      return `STRICT TARGET: MOTION ARRAY / ARTGRID (ARTLIST)
- Cinematic aesthetic focus: Highlight lighting atmosphere (golden hour, neon, daylight), camera movement, color grading tone, and authentic filmmaking storytelling.`;
    case 'freepik':
    case 'vecteezy':
    case 'dreamstime':
      return `STRICT TARGET: ${platform.toUpperCase()} VIDEO
- Minimum 5 words descriptive title without keyword stuffing. Clean single-word tags covering subjects, environment, and mood.`;
    default:
      return `STRICT TARGET: UNIVERSAL (ALL 9 STOCK MARKETPLACES COMPLIANCE)
- Formula: [Camera Movement] + [Subject] + [Action Verb] + [Environment/Location] + [Lighting/Mood].
- Title length: balanced 80-120 chars. Max 49 single keywords for 100% interoperability across Adobe, Pond5, Shutterstock, Getty, Envato, Artgrid, Freepik, Vecteezy, and Dreamstime.`;
  }
};

export const uploadVideoAndGenerateMeta = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const userId = (req as any).user._id;
    const user = await User.findById(userId);

    if (!user) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Video generation costs 2 credits
    const REQUIRED_CREDITS = 2;
    if (user.credits < REQUIRED_CREDITS) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(403).json({ error: `Not enough credits. Video metadata generation requires ${REQUIRED_CREDITS} credits.` });
      return;
    }

    const {
      platform = 'universal',
      titleLength = '120',
      descriptionLength = '200',
      keywordCount = '49',
      prefix = '',
      suffix = '',
      negativeTitleWords = '',
      negativeKeywords = '',
      selectedShotType = '',
      selectedMood = '',
      duration = '',
      resolution = '',
      fps = ''
    } = req.body;

    // 1. Upload video to Cloudinary
    let videoUrl = '';
    let thumbnailUrl = '';
    let detectedDuration = Number(duration) || 0;
    let detectedResolution = resolution || '1080p';

    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlvywmmyv',
        api_key: process.env.CLOUDINARY_API_KEY || '131729124253139',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'XxCRc2o1Rmyy4NDNG7IQkvsooiE',
      });

      const uploadResult = await cloudinary.uploader.upload(file.path, {
        resource_type: 'video',
        folder: 'stock-videos'
      });

      videoUrl = uploadResult.secure_url;
      thumbnailUrl = uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg');
      if (uploadResult.duration) detectedDuration = Math.round(uploadResult.duration);
      if (uploadResult.width && uploadResult.height) {
        detectedResolution = uploadResult.width >= 3840 ? '4K UHD' : `${uploadResult.width}x${uploadResult.height}`;
      }
    } catch (uploadError) {
      console.warn('Cloudinary Video Upload Error (will continue with metadata):', uploadError);
      videoUrl = file.originalname;
    }

    // 2. Prepare Gemini Multimodal Video & Keyframe Prompt
    const genAI = getGeminiClient();

    let mimeType = file.mimetype;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!mimeType || mimeType === 'application/octet-stream') {
      if (ext === '.mp4' || ext === '.m4v') mimeType = 'video/mp4';
      else if (ext === '.mov' || ext === '.qt') mimeType = 'video/quicktime';
      else if (ext === '.webm') mimeType = 'video/webm';
      else if (ext === '.avi') mimeType = 'video/x-msvideo';
      else if (ext === '.mkv') mimeType = 'video/x-matroska';
      else if (ext === '.wmv') mimeType = 'video/x-ms-wmv';
      else if (ext === '.flv') mimeType = 'video/x-flv';
      else mimeType = 'video/mp4';
    }

    const platformGuidance = getPlatformGuidance(platform);

    const systemPrompt = `You are the World's #1 Stock Footage SEO & Metadata Specialist, optimizing video clips for the Top 9 Marketplaces:
1. Adobe Stock Video
2. Shutterstock Footage
3. Pond5 (Specialized Video Marketplace)
4. Getty Images / iStock
5. Envato Elements & VideoHive
6. Motion Array / Artgrid (Artlist)
7. Freepik Video
8. Vecteezy Video
9. Dreamstime Video

ANALYZE THIS VIDEO CLIP CAREFULLY. Notice the movement, subjects, actions, lighting, camera angle, speed, and context.

${platformGuidance}

Generate high-converting commercial stock video metadata strictly adhering to these rules:

1. ACTION TITLE:
- Formula: [Camera Movement/Shot Type] + [Subject/Protagonist] + [Action Verb] + [Environment/Location] + [Lighting/Mood/Time].
- Target length: ${titleLength} characters (Maximum 200 characters).
- MUST be an action-oriented, natural English descriptive sentence (e.g. "Aerial drone shot of turquoise ocean waves crashing on tropical sandy beach at sunset").
- DO NOT use camera brand names (Sony, Canon, iPhone) or generic buzzwords (e.g. "4K ultra HD best quality").
${prefix ? `- Mandatory Prefix: "${prefix}"` : ''}
${suffix ? `- Mandatory Suffix: "${suffix}"` : ''}
${negativeTitleWords ? `- FORBIDDEN WORDS IN TITLE: ${negativeTitleWords}` : ''}

2. DESCRIPTION:
- A clear, full-sentence description (around ${descriptionLength} characters) describing the video clip, its mood, visual details, and commercial potential for editors and advertisers.

3. CATEGORIES:
- "category": Primary general category (e.g., Nature, Business, Technology, People, Travel, Aerial, City, Lifestyle, Animals).
- "adobeCategory": Official Adobe Stock Category name.
- "shutterstockCategory": Official Shutterstock Category name.
- "pond5Category": Official Pond5 Video Category name.

4. 4-LAYER KEYWORD PYRAMID (Target: Exactly ${keywordCount} keywords):
- Layer 1 (Exact Subjects): Main people, objects, elements directly visible.
- Layer 2 (Motion & Camera Dynamics): e.g. "aerial", "drone shot", "slow motion", "panning", "tracking shot", "gimbal", "handheld", "timelapse", "b-roll", "smooth motion", "cinematic".
- Layer 3 (Setting, Environment & Lighting): e.g. "golden hour", "sunset", "studio", "daylight", "night", "cityscape", "forest", "indoor", "outdoor".
- Layer 4 (Commercial & Buyer Concepts): e.g. "business", "freedom", "luxury", "success", "future", "technology", "relaxation", "adventure".
- RULES:
  * 90-95% MUST BE SINGLE WORDS (e.g. "drone", "aerial", "ocean", "waves" instead of "drone shot of ocean waves").
  * Max 49 unique keywords. No duplicates.
  * Strict anti-spam: NO brand names (Sony, Apple, Nike, etc.), NO prohibited spam tags.
${negativeKeywords ? `- FORBIDDEN KEYWORDS: ${negativeKeywords}` : ''}

5. TECHNICAL DETECTIONS:
- "shotType": Detected camera movement (e.g., Drone / Aerial, Smooth Gimbal, Slow Motion, Tripod Static, Handheld, Timelapse, Close-up, Wide).
- "mood": Detected visual lighting/mood (e.g., Golden Hour, Cinematic, Daylight, Moody Night, Studio Clean).

RESPONSE FORMAT:
You MUST respond with ONLY a valid, raw JSON object (no markdown code blocks, no backticks, no extra text):
{
  "title": "string",
  "description": "string",
  "category": "string",
  "adobeCategory": "string",
  "shutterstockCategory": "string",
  "pond5Category": "string",
  "keywords": ["keyword1", "keyword2", ...],
  "shotType": "string",
  "mood": "string"
}`;

    let parsedMetadata: any = null;

    try {
      const videoDataBuffer = fs.readFileSync(file.path);
      const videoPart = {
        inlineData: {
          data: videoDataBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await generateWithFallback(genAI, [systemPrompt, videoPart]);
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedMetadata = JSON.parse(cleanJson);
    } catch (aiError: any) {
      console.warn('Gemini direct video inline failed, attempting prompt with video specs:', aiError);
      // Fallback: Generate based on technical metadata and filename
      const fallbackPrompt = `${systemPrompt}\n\nFile info: Name="${file.originalname}", Format="${mimeType}", SelectedShot="${selectedShotType}", SelectedMood="${selectedMood}".`;
      const result = await generateWithFallback(genAI, fallbackPrompt);
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedMetadata = JSON.parse(cleanJson);
    }

    // Clean up local uploaded video file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (!parsedMetadata || !parsedMetadata.title || !Array.isArray(parsedMetadata.keywords)) {
      res.status(500).json({ error: 'Failed to parse video metadata from AI response' });
      return;
    }

    // Ensure max 49 keywords and single-word formatting
    let cleanedKeywords = parsedMetadata.keywords
      .map((k: string) => k.toLowerCase().trim())
      .filter((k: string) => k.length > 1 && !k.includes('sony') && !k.includes('canon') && !k.includes('nikon'))
      .slice(0, Number(keywordCount) || 49);

    // Save to Database
    const newVideoMeta = await VideoMetaData.create({
      user: userId,
      videoUrl,
      thumbnailUrl,
      duration: detectedDuration,
      resolution: detectedResolution,
      fps: Number(fps) || 30,
      shotType: parsedMetadata.shotType || selectedShotType || 'Cinematic',
      mood: parsedMetadata.mood || selectedMood || 'Natural Light',
      title: parsedMetadata.title,
      description: parsedMetadata.description || parsedMetadata.title,
      category: parsedMetadata.category || 'Nature',
      adobeCategory: parsedMetadata.adobeCategory || 'Nature',
      shutterstockCategory: parsedMetadata.shutterstockCategory || 'Nature',
      pond5Category: parsedMetadata.pond5Category || 'Nature',
      keywords: cleanedKeywords,
      platform
    });

    // Deduct 2 credits
    user.credits -= REQUIRED_CREDITS;
    await user.save();

    res.status(200).json({
      success: true,
      creditsRemaining: user.credits,
      metadata: newVideoMeta
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Video Metadata Error:', error);
    res.status(500).json({ error: error.message || 'Video metadata generation failed' });
  }
};

export const regenerateVideoMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const REGEN_CREDITS = 2;
    if (user.credits < REGEN_CREDITS) {
      res.status(403).json({ error: `Not enough credits. Regenerating costs ${REGEN_CREDITS} credits.` });
      return;
    }

    const {
      videoUrl,
      platform = 'universal',
      titleLength = 120,
      descriptionLength = 200,
      keywordCount = 49,
      prefix = '',
      suffix = '',
      negativeTitleWords = '',
      negativeKeywords = '',
      selectedShotType = '',
      selectedMood = ''
    } = req.body;

    if (!videoUrl) {
      res.status(400).json({ error: 'No video URL provided for regeneration' });
      return;
    }

    const genAI = getGeminiClient();
    const platformGuidance = getPlatformGuidance(platform);
    const prompt = `You are an elite Stock Video SEO Specialist. Regenerate a brand new, highly engaging Action Title and 49 fresh, high-converting buyer-intent single keywords for this stock video (${videoUrl}).

${platformGuidance}

Parameters:
- Target Title Length: ${titleLength} characters.
- Shot Type: ${selectedShotType || 'Cinematic / Aerial'}
- Mood: ${selectedMood || 'Golden Hour / Natural'}
- Max Keywords: ${keywordCount}
${prefix ? `- Prefix: ${prefix}` : ''}
${suffix ? `- Suffix: ${suffix}` : ''}
${negativeTitleWords ? `- Negative Title Words: ${negativeTitleWords}` : ''}
${negativeKeywords ? `- Negative Keywords: ${negativeKeywords}` : ''}

Respond ONLY in raw JSON:
{
  "title": "...",
  "description": "...",
  "category": "...",
  "adobeCategory": "...",
  "shutterstockCategory": "...",
  "pond5Category": "...",
  "keywords": ["..."],
  "shotType": "...",
  "mood": "..."
}`;

    const result = await generateWithFallback(genAI, prompt);
    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    user.credits -= REGEN_CREDITS;
    await user.save();

    res.status(200).json({
      success: true,
      creditsRemaining: user.credits,
      metadata: {
        ...parsed,
        videoUrl,
        keywords: parsed.keywords.slice(0, keywordCount)
      }
    });
  } catch (error: any) {
    console.error('Regenerate Video Metadata Error:', error);
    res.status(500).json({ error: error.message || 'Failed to regenerate video metadata' });
  }
};

export const getVideoHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const history = await VideoMetaData.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch video history' });
  }
};

export const deleteVideoHistoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;
    await VideoMetaData.findOneAndDelete({ _id: id, user: userId });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete history item' });
  }
};
