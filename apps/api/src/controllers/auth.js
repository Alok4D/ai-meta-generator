"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.getMe = exports.googleLogin = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                role: user.role,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (user && user.password && (await bcryptjs_1.default.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                role: user.role,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.loginUser = loginUser;
const googleLogin = async (req, res) => {
    const { email, name } = req.body;
    try {
        let user = await User_1.default.findOne({ email });
        if (!user) {
            // Create user if not exists
            const randomPassword = Math.random().toString(36).slice(-10);
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(randomPassword, salt);
            user = await User_1.default.create({
                name,
                email,
                password: hashedPassword,
                credits: 100, // Default credits for new Google users
            });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
            role: user.role,
            token: generateToken(user._id),
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error during Google Login' });
    }
};
exports.googleLogin = googleLogin;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getMe = getMe;
const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;
    try {
        const user = await User_1.default.findById(userId);
        if (!user || !user.password) {
            res.status(404).json({ error: 'User not found or using OAuth' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating password' });
    }
};
exports.updatePassword = updatePassword;
const forgotPassword = async (req, res) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(404).json({ error: 'There is no user with that email' });
            return;
        }
        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        // Create reset url
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to: \n\n ${resetUrl}`;
        try {
            await (0, sendEmail_1.default)({
                email: user.email,
                subject: 'Password reset token',
                message,
            });
            res.status(200).json({ success: true, message: 'Email sent' });
        }
        catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ error: 'Email could not be sent' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        const user = await User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }
        // Set new password
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            token: generateToken(user._id)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
const updateProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { name, phone } = req.body;
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary_1.v2.uploader.upload(req.file.path, {
                folder: 'ai-meta-generator/avatars',
            });
            // Remove local file
            fs_1.default.unlinkSync(req.file.path);
            user.avatar = result.secure_url;
        }
        await user.save();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            token: generateToken(user._id),
        });
    }
    catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth.js.map