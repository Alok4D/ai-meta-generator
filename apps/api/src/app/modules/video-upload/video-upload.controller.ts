import { Request, Response } from 'express';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import VideoMetaData from './video-upload.model';
import User from '../auth/user.model';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBrySGZYQqoW92cy5TR5wodukjdhFGsrRM';
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
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
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        resource_type: 'video',
        folder: 'stock-videos',
        eager: [
          { format: 'jpg', transformation: [{ width: 640, crop: 'scale' }] }
        ]
      });

      videoUrl = uploadResult.secure_url;
      // Get auto-generated poster / thumbnail from Cloudinary video
      thumbnailUrl = uploadResult.eager && uploadResult.eager[0] ? uploadResult.eager[0].secure_url : uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg');
      if (uploadResult.duration) detectedDuration = Math.round(uploadResult.duration);
      if (uploadResult.width && uploadResult.height) {
        detectedResolution = uploadResult.width >= 3840 ? '4K UHD' : `${uploadResult.width}x${uploadResult.height}`;
      }
    } catch (uploadError) {
      console.error('Cloudinary Video Upload Error:', uploadError);
      // Fallback: local url if cloudinary fails in test
      videoUrl = `/uploads/${file.filename}`;
    }

    // 2. Prepare Gemini Multimodal Video & Keyframe Prompt
    const model = getGeminiModel();

    // Read local video buffer for Gemini inlineData
    const videoDataBuffer = fs.readFileSync(file.path);
    const mimeType = file.mimetype || 'video/mp4';

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
      // Gemini 1.5 Flash supports video inlineData up to 20MB directly
      const videoPart = {
        inlineData: {
          data: videoDataBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([systemPrompt, videoPart]);
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedMetadata = JSON.parse(cleanJson);
    } catch (aiError: any) {
      console.warn('Gemini direct video inline failed, attempting prompt with video specs:', aiError);
      // Fallback: Generate based on technical metadata and filename
      const fallbackPrompt = `${systemPrompt}\n\nFile info: Name="${file.originalname}", Format="${mimeType}", SelectedShot="${selectedShotType}", SelectedMood="${selectedMood}".`;
      const result = await model.generateContent(fallbackPrompt);
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

    const model = getGeminiModel();
    const prompt = `You are an elite Stock Video SEO Specialist. Regenerate a brand new, highly engaging Action Title and 49 fresh, high-converting buyer-intent single keywords for this stock video (${videoUrl}).

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

    const result = await model.generateContent(prompt);
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
