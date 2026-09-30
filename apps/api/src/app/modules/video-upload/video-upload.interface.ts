import mongoose, { Document } from 'mongoose';

export interface IVideoMetaData extends Document {
  user: mongoose.Types.ObjectId;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  resolution?: string;
  fps?: number;
  shotType?: string;
  mood?: string;
  title: string;
  description?: string;
  category?: string;
  adobeCategory?: string;
  shutterstockCategory?: string;
  pond5Category?: string;
  keywords: string[];
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}
