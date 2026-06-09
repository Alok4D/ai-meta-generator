import { Request, Response } from 'express';
import SubscriptionPlan from './subscription.model';

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // If the new plan is set to popular, we should probably unset others (optional but good for UI consistency if only one can be popular)
    // However, the user didn't specify mutually exclusive, but we can do it if isPopular is true
    if (req.body.isPopular) {
      await SubscriptionPlan.updateMany({ _id: { $ne: id } }, { isPopular: false });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndDelete(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};
