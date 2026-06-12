import mongoose, { Schema, Document } from 'mongoose';
import * as crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  credits: number;
  role: 'user' | 'admin';
  activePlan?: mongoose.Types.ObjectId;
  planExpireDate?: Date;
  avatar?: string;
  phone?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  getResetPasswordToken(): string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  credits: { type: Number, default: 30 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  activePlan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
  planExpireDate: { type: Date },
  avatar: { type: String, required: false },
  phone: { type: String, required: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true
});

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export default mongoose.model<IUser>('User', UserSchema);
