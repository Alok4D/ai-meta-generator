import { Request, Response } from "express";
import SupportMessage from "./support.model";

export const submitSupportMessage = async (req: any, res: any) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required" });
    }

    const newMsg = await SupportMessage.create({
      user: req.user._id,
      subject,
      message,
    });

    res.status(201).json(newMsg);
  } catch (error) {
    console.error("Support submission error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
