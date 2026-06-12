import { Schema, model, Types } from 'mongoose';

export interface ITransaction {
  user: Types.ObjectId;
  plan: Types.ObjectId;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'usd' },
  stripeSessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, {
  timestamps: true,
});

const Transaction = model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
