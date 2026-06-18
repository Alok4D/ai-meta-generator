import { Schema, model } from 'mongoose';

export interface ISubscriptionPlan {
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
  credits: number;
  validityDays: number;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  period: { type: String, required: true, default: 'month' },
  features: { type: [String], required: true },
  isPopular: { type: Boolean, default: false },
  buttonText: { type: String, default: 'Upgrade' },
  credits: { type: Number, required: true, default: 0 },
  validityDays: { type: Number, required: true, default: 30 }
}, {
  timestamps: true,
});

const SubscriptionPlan = model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
