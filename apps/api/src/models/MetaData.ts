import mongoose, { Schema, Document } from 'mongoose';

export interface IMetaData extends Document {
  user: mongoose.Types.ObjectId;
  imageUrl: string;
  title: string;
  category: string;
  keywords: string[];
}

const MetaDataSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  keywords: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.model<IMetaData>('MetaData', MetaDataSchema);
