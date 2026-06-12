import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubscriptionPlan from './src/app/modules/subscription/subscription.model';

dotenv.config();

const plans = [
  {
    name: 'Free',
    description: 'Perfect for trying out the platform.',
    price: 0,
    period: 'forever',
    features: [
      '30 Credits Per Month',
      'Standard SEO Output',
      'Recent Generation History',
      'Single Image Upload',
      'AI Title, Category, Keywords and others',
      'TXT File Download',
      'Lifetime Access'
    ],
    isPopular: false,
    buttonText: 'Current Plan'
  },
  {
    name: 'Pro',
    description: 'For freelancers and content creators.',
    price: 19,
    period: 'month',
    features: [
      '2000 Credits Per Month',
      'Universal Stock Optimization',
      'Batch Upload (up to 50)',
      'CSV & TXT Export',
      'Priority Support',
      'Copy All Keywords',
      'Recent Generation History'
    ],
    isPopular: true,
    buttonText: 'Upgrade to Pro'
  },
  {
    name: 'Agency',
    description: 'Unlimited power for your entire team.',
    price: 99,
    period: 'month',
    features: [
      'Unlimited images',
      'All Output Modes',
      'Unlimited Batch Upload',
      'Custom API Access',
      '24/7 Dedicated Support',
      'Bulk Metadata Generation',
      'Faster Processing',
      'CSV & TXT Export'
    ],
    isPopular: false,
    buttonText: 'Contact Sales'
  }
];

const seedPlans = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not defined in .env');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing subscription plans.');

    // Insert new plans
    await SubscriptionPlan.insertMany(plans);
    console.log('Successfully seeded 3 subscription plans!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedPlans();
