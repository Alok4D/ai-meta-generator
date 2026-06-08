import mongoose from "mongoose";

export interface ISupportMessage extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: "pending" | "in_review" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISupportMessage>("SupportMessage", SupportMessageSchema);
