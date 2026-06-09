"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const SupportMessage_1 = __importDefault(require("../models/SupportMessage"));
const router = (0, express_1.Router)();
// Submit a support message
router.post("/", auth_1.protect, async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ error: "Subject and message are required" });
        }
        const newMsg = await SupportMessage_1.default.create({
            user: req.user._id,
            subject,
            message,
        });
        res.status(201).json(newMsg);
    }
    catch (error) {
        console.error("Support submission error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=support.js.map