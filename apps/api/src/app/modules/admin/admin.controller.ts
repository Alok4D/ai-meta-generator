import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../auth/user.model';
import MetaData from '../upload/metaData.model';
import SupportMessage from '../support/support.model';
import Transaction from '../payment/transaction.model';

export const getOverviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await MetaData.countDocuments();
    
    // Calculate total revenue from completed transactions
    const completedTransactions = await Transaction.find({ status: 'completed' }, 'amount');
    const totalRevenue = completedTransactions.reduce((acc, trx) => acc + (trx.amount || 0), 0);
    
    // Total premium users
    const totalPremiumUsers = await User.countDocuments({ activePlan: { $ne: null } });
    
    // Pending support tickets
    const pendingSupportTickets = await SupportMessage.countDocuments({ status: 'pending' });

    // Last 7 days data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const userGrowthRaw = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const uploadGrowthRaw = await MetaData.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for charts, ensuring all 7 days are present
    const userGrowth = [];
    const uploadGrowth = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const userDay = userGrowthRaw.find(d => d._id === dateStr);
      userGrowth.push({
        name: shortDate,
        date: dateStr,
        users: userDay ? userDay.count : 0
      });

      const uploadDay = uploadGrowthRaw.find(d => d._id === dateStr);
      uploadGrowth.push({
        name: shortDate,
        date: dateStr,
        uploads: uploadDay ? uploadDay.count : 0
      });
    }

    // Recent Users
    const recentUsers = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('activePlan');

    // Recent Transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('plan', 'name');

    res.json({
      totalUsers,
      totalUploads,
      totalRevenue,
      totalPremiumUsers,
      pendingSupportTickets,
      userGrowth,
      uploadGrowth,
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching overview stats' });
  }
};

import SubscriptionPlan from '../subscription/subscription.model';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const plan = req.query.plan as string;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (plan && plan !== 'all') {
      if (plan.toLowerCase() === 'free') {
        query.activePlan = { $exists: false };
      } else {
        const subscriptionPlan = await SubscriptionPlan.findOne({ name: { $regex: `^${plan}$`, $options: 'i' } });
        if (subscriptionPlan) {
          query.activePlan = subscriptionPlan._id;
        } else {
          query.activePlan = new mongoose.Types.ObjectId('000000000000000000000000');
        }
      }
    }

    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('activePlan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const imagesGenerated = await MetaData.countDocuments({ user: user._id });
        return { ...user.toObject(), imagesGenerated };
      })
    );

    res.json({
      users: usersWithStats,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

export const getAllGenerations = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const userId = req.query.userId as string;

    const query: any = {};

    if (userId) {
      query.user = userId;
    }

    if (search) {
      // Search in title, description or category
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const total = await MetaData.countDocuments(query);
    const generations = await MetaData.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      generations,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    res.status(500).json({ error: 'Server error fetching generations' });
  }
};

export const getUserGenerationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string;

    // We can fetch all users that match search and then get their stats
    // But aggregation is better
    const matchStage: any = {};
    
    // First, find users matching the search criteria if any
    let userIds: mongoose.Types.ObjectId[] = [];
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }, '_id');
      userIds = users.map(u => u._id);
      matchStage.user = { $in: userIds };
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$user',
          totalGenerations: { $sum: 1 },
          lastGenerationDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalGenerations: -1 as const } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ];

    const result = await MetaData.aggregate(pipeline);
    
    const total = result[0].metadata[0]?.total || 0;
    let stats = result[0].data;

    // Populate user details
    stats = await User.populate(stats, { path: '_id', select: 'name email avatar' });

    // Rename _id to user for cleaner frontend consumption
    const formattedStats = stats.map((stat: any) => ({
      user: stat._id,
      totalGenerations: stat.totalGenerations,
      lastGenerationDate: stat.lastGenerationDate
    })).filter((stat: any) => stat.user != null); // filter out if user was deleted

    res.json({
      stats: formattedStats,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching user generation stats:', error);
    res.status(500).json({ error: 'Server error fetching generation stats' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role, credits } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (role) user.role = role;
    if (credits !== undefined) user.credits = credits;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      credits: updatedUser.credits,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await User.deleteOne({ _id: id });

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

export const getAllSupportMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await SupportMessage.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching support messages' });
  }
};

export const updateSupportMessageStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const message = await SupportMessage.findById(id);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (status) message.status = status;

    const updatedMessage = await message.save();
    
    // populate user before returning
    await updatedMessage.populate('user', 'name email');

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating message status' });
  }
};
