import { Request, Response } from 'express';
import Stripe from 'stripe';
import SubscriptionPlan from '../subscription/subscription.model';
import Transaction from './transaction.model';
import User from '../auth/user.model';
import sendEmail from '../../utils/sendEmail';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10' as any, // Using the latest or compatible version
});

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Convert price to cents
    const amountInCents = Math.round(plan.price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} Plan - MetaGen AI`,
              description: plan.description,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // using payment mode for one-time charge representing a subscription period, or 'subscription' if we had products in Stripe
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/pricing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  let event: any;

  try {
    // req.body must be the raw buffer here
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (userId && planId) {
      const plan = await SubscriptionPlan.findById(planId);
      
      if (plan) {
        let creditsToAssign = 30;
        if (plan.name === 'Pro') creditsToAssign = 2000;
        if (plan.name === 'Agency') creditsToAssign = 9999999;

        const planExpireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await User.findByIdAndUpdate(userId, {
          activePlan: plan._id,
          credits: creditsToAssign,
          planExpireDate,
        });

        await Transaction.create({
          user: userId,
          plan: plan._id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          stripeSessionId: session.id,
          status: 'completed',
        });
      }
    }
  }

  res.json({ received: true });
};

export const getUserTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const transactions = await Transaction.find({ user: userId })
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email avatar')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?._id;

    if (!sessionId || !userId) {
      res.status(400).json({ error: 'Session ID and User ID are required' });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.status(400).json({ error: 'Payment not successful' });
      return;
    }

    // Check if transaction already exists
    const existingTx = await Transaction.findOne({ stripeSessionId: sessionId });
    
    let plan = null;
    let transactionId = existingTx?._id;

    if (!existingTx) {
      const planId = session.metadata?.planId;
      if (planId) {
        plan = await SubscriptionPlan.findById(planId);
        
        if (plan) {
          const creditsToAssign = plan.credits || (plan.name?.toLowerCase() === 'unlimited' ? 9999999 : plan.name?.toLowerCase() === 'max' ? 2000 : plan.name?.toLowerCase() === 'pro' ? 1000 : plan.name?.toLowerCase() === 'lite' ? 400 : 30);
          
          let validityDays = plan.validityDays || 30;
          if (!plan.validityDays || plan.validityDays === 30) {
            if (plan.name?.toLowerCase() === 'lite') validityDays = 90;
            else if (plan.name?.toLowerCase() === 'pro') validityDays = 180;
            else if (plan.name?.toLowerCase() === 'max' || plan.name?.toLowerCase() === 'unlimited') validityDays = 365;
          }
          
          const planExpireDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

          const updatedUser = await User.findByIdAndUpdate(userId, {
            activePlan: plan._id,
            credits: creditsToAssign,
            planExpireDate,
          }, { new: true });

          const newTx = await Transaction.create({
            user: userId,
            plan: plan._id,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'usd',
            stripeSessionId: session.id,
            status: 'completed',
          });
          transactionId = newTx._id;
        }
      }
    } else {
      plan = await SubscriptionPlan.findById(existingTx.plan);
    }

    // Always fetch latest user to return
    const currentUser = await User.findById(userId).populate('activePlan');

    res.status(200).json({ 
      success: true, 
      amount: (session.amount_total || 0) / 100, 
      planName: plan?.name,
      transactionId,
      user: currentUser
    });

  } catch (error: any) {
    console.error('Error verifying checkout session:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });
    if (!freePlan) {
      res.status(404).json({ error: 'Free plan not found' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      activePlan: freePlan._id,
      credits: 30,
      planExpireDate: undefined, // Free plan doesn't expire
    }, { new: true }).populate('activePlan');

    res.status(200).json({ 
      success: true, 
      message: 'Subscription canceled successfully',
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const submitManualPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { planId, paymentMethod, senderNumber, trxId, amount } = req.body;

    if (!planId || !paymentMethod || !senderNumber || !trxId) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const existingTrx = await Transaction.findOne({ trxId });
    if (existingTrx) {
      res.status(400).json({ error: 'Transaction ID already exists' });
      return;
    }

    const newTx = await Transaction.create({
      user: userId,
      plan: plan._id,
      amount: amount || plan.price,
      currency: 'bdt',
      paymentMethod,
      senderNumber,
      trxId,
      stripeSessionId: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'pending',
    });

    // Send email to admin
    try {
      const adminEmails = process.env.ADMIN_EMAIL || 'alokroy602701@gmail.com';
      await sendEmail({
        email: adminEmails,
        fromName: 'MetaGen AI Payments',
        subject: `New Manual Payment Request - ${paymentMethod.toUpperCase()}`,
        message: `A new manual payment request has been submitted.\n\nUser: ${req.user?.name || 'Customer'} (<a href="mailto:${req.user?.email}">${req.user?.email}</a>)\nMethod: ${paymentMethod.toUpperCase()}\nSender Number: ${senderNumber}\nTrxID: ${trxId}\nAmount: ${amount || plan.price} BDT\nPlan: ${plan.name}\n\nPlease verify and approve from the Admin Dashboard.`
      });
    } catch (err) {
      console.error('Failed to send admin email notification:', err);
    }

    // Send confirmation email to user
    try {
      if (req.user?.email) {
        await sendEmail({
          email: req.user.email,
          fromName: 'MetaGen AI Support',
          subject: `Payment Request Received - MetaGen AI`,
          message: `Hello ${req.user.name || 'Valued Customer'},\n\nWe have received your manual payment request for the ${plan.name} plan via ${paymentMethod.toUpperCase()}.\n\nTransaction ID: ${trxId}\nAmount: ${amount || plan.price} BDT\n\nOur admin team is currently verifying your payment. Your account will be upgraded shortly.\n\nThank you for choosing MetaGen AI!`
        });
      }
    } catch (err) {
      console.error('Failed to send user email notification:', err);
    }

    res.status(200).json({ success: true, message: 'Payment submitted successfully. Please wait for verification.', transaction: newTx });
  } catch (error: any) {
    console.error('Error submitting manual payment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getPendingManualPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ paymentMethod: { $in: ['bkash', 'nagad'] }, status: 'pending' })
      .populate('user', 'name email avatar')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching pending manual payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyManualPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, status } = req.body;

    if (!['completed', 'failed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be completed or failed.' });
      return;
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    if (transaction.status !== 'pending') {
      res.status(400).json({ error: 'Transaction is already processed' });
      return;
    }

    transaction.status = status;
    await transaction.save();

    if (status === 'completed') {
      const plan = await SubscriptionPlan.findById(transaction.plan);
      if (plan) {
        const creditsToAssign = plan.credits || (plan.name?.toLowerCase() === 'unlimited' ? 9999999 : plan.name?.toLowerCase() === 'max' ? 2000 : plan.name?.toLowerCase() === 'pro' ? 1000 : plan.name?.toLowerCase() === 'lite' ? 400 : 30);
        
        let validityDays = plan.validityDays || 30;
        if (!plan.validityDays || plan.validityDays === 30) {
          if (plan.name?.toLowerCase() === 'lite') validityDays = 90;
          else if (plan.name?.toLowerCase() === 'pro') validityDays = 180;
          else if (plan.name?.toLowerCase() === 'max' || plan.name?.toLowerCase() === 'unlimited') validityDays = 365;
        }

        const planExpireDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

        await User.findByIdAndUpdate(transaction.user, {
          activePlan: plan._id,
          credits: creditsToAssign,
          planExpireDate,
        });
      }
    }

    res.status(200).json({ success: true, message: `Payment ${status} successfully` });
  } catch (error: any) {
    console.error('Error verifying manual payment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Only admin or the owner can delete
    if (userRole !== 'admin' && transaction.user.toString() !== userId.toString()) {
      res.status(403).json({ error: 'You do not have permission to delete this transaction' });
      return;
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
