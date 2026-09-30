import mongoose, { Schema } from 'mongoose';
import { IVideoMetaData } from './video-upload.interface';

const VideoMetaDataSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: false },
  duration: { type: Number, required: false },
  resolution: { type: String, required: false },
  fps: { type: Number, required: false },
  shotType: { type: String, required: false },
  mood: { type: String, required: false },
  title: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: false },
  adobeCategory: { type: String, required: false },
  shutterstockCategory: { type: String, required: false },
  pond5Category: { type: String, required: false },
  keywords: [{ type: String }],
  platform: { type: String, default: 'universal' }
}, {
  timestamps: true
});

export default mongoose.model<IVideoMetaData>('VideoMetaData', VideoMetaDataSchema);
