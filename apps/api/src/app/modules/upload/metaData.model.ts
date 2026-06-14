import mongoose, { Schema, Document } from 'mongoose';

export interface IMetaData extends Document {
  user: mongoose.Types.ObjectId;
  imageUrl: string;
  title?: string;
  description?: string;
  category: string;
  keywords: string[];
  platform: string;
}

const MetaDataSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  title: { type: String, required: false },
  description: { type: String, required: false },
  category: { type: String, required: true },
  keywords: [{ type: String }],
  platform: { type: String, default: 'general' }
}, {
  timestamps: true
});

export default mongoose.model<IMetaData>('MetaData', MetaDataSchema);
