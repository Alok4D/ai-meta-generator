import { Request, Response } from 'express';
import Stripe from 'stripe';
import SubscriptionPlan from '../subscription/subscription.model';
import Transaction from './transaction.model';
import User from '../auth/user.model';
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
  let event: Stripe.Event;

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
    const session = event.data.object as Stripe.Checkout.Session;
    
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
          let creditsToAssign = 30;
          if (plan.name === 'Pro') creditsToAssign = 2000;
          if (plan.name === 'Agency') creditsToAssign = 9999999;

          const planExpireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
