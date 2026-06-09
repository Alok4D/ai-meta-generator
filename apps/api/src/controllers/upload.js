"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const MetaData_1 = __importDefault(require("../models/MetaData"));
const User_1 = __importDefault(require("../models/User"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash_on_startup',
});
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const user = await User_1.default.findById(req.user?._id);
        if (!user || user.credits <= 0) {
            res.status(403).json({ error: 'Not enough credits' });
            return;
        }
        // 1. Upload to Cloudinary
        const result = await cloudinary_1.v2.uploader.upload(req.file.path, {
            folder: 'ai-meta-generator',
        });
        // Remove local file
        fs_1.default.unlinkSync(req.file.path);
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
        const aiResponse = response.choices[0]?.message?.content || '{}';
        let metadata;
        try {
            metadata = JSON.parse(aiResponse);
        }
        catch (e) {
            // fallback parsing if surrounded by ```json ... ```
            const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            metadata = JSON.parse(cleaned);
        }
        // 3. Save to MongoDB
        const metaDataDoc = await MetaData_1.default.create({
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
    }
    catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
};
exports.uploadImage = uploadImage;
const getHistory = async (req, res) => {
    try {
        const history = await MetaData_1.default.find({ user: req.user?._id }).sort({ createdAt: -1 });
        res.status(200).json(history);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
exports.getHistory = getHistory;
//# sourceMappingURL=upload.js.map