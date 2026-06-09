"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupportMessageStatus = exports.getAllSupportMessages = exports.updateUser = exports.getAllUsers = exports.getOverviewStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const MetaData_1 = __importDefault(require("../models/MetaData"));
const getOverviewStats = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalUploads = await MetaData_1.default.countDocuments();
        // Calculate total credits used
        const users = await User_1.default.find({}, 'credits');
        const totalCreditsRemaining = users.reduce((acc, user) => acc + user.credits, 0);
        const totalCreditsDistributed = totalUsers * 100;
        const totalCreditsUsed = totalCreditsDistributed - totalCreditsRemaining;
        res.json({
            totalUsers,
            totalUploads,
            totalCreditsUsed: totalCreditsUsed > 0 ? totalCreditsUsed : 0
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error fetching overview stats' });
    }
};
exports.getOverviewStats = getOverviewStats;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { role, credits } = req.body;
    try {
        const user = await User_1.default.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (role)
            user.role = role;
        if (credits !== undefined)
            user.credits = credits;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            credits: updatedUser.credits,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating user' });
    }
};
exports.updateUser = updateUser;
const SupportMessage_1 = __importDefault(require("../models/SupportMessage"));
const getAllSupportMessages = async (req, res) => {
    try {
        const messages = await SupportMessage_1.default.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error fetching support messages' });
    }
};
exports.getAllSupportMessages = getAllSupportMessages;
const updateSupportMessageStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const message = await SupportMessage_1.default.findById(id);
        if (!message) {
            res.status(404).json({ error: 'Message not found' });
            return;
        }
        if (status)
            message.status = status;
        const updatedMessage = await message.save();
        // populate user before returning
        await updatedMessage.populate('user', 'name email');
        res.json(updatedMessage);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating message status' });
    }
};
exports.updateSupportMessageStatus = updateSupportMessageStatus;
//# sourceMappingURL=admin.js.map