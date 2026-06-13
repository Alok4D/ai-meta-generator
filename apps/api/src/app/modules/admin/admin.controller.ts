import { Request, Response } from 'express';
import User from '../auth/user.model';
import MetaData from '../upload/metaData.model';
import SupportMessage from '../support/support.model';

export const getOverviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await MetaData.countDocuments();
    
    // Calculate total credits used
    const users = await User.find({}, 'credits');
    const totalCreditsRemaining = users.reduce((acc, user) => acc + user.credits, 0);
    const totalCreditsDistributed = totalUsers * 100;
    const totalCreditsUsed = totalCreditsDistributed - totalCreditsRemaining;

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

    res.json({
      totalUsers,
      totalUploads,
      totalCreditsUsed: totalCreditsUsed > 0 ? totalCreditsUsed : 0,
      userGrowth,
      uploadGrowth
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching overview stats' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string;
    const role = req.query.role as string;

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

    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('activePlan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
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
