import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import User from './user.model';
import * as crypto from 'crypto';
import sendEmail from '../../utils/sendEmail';
import SubscriptionPlan from '../subscription/subscription.model';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import { isDisposableEmail } from 'disposable-email-domains-js';

const generateEmailTemplate = (title: string, contentHTML: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
      .header { background-color: #3b82f6; padding: 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; display: inline-flex; align-items: center; gap: 10px; }
      .title { text-align: center; font-size: 20px; color: #333; padding: 20px; border-bottom: 1px solid #eeeeee; margin: 0; }
      .content { padding: 30px; font-size: 14px; }
      .otp-box { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; }
      .footer { margin-top: 30px; font-size: 14px; color: #555; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Meta Generator</h1>
      </div>
      <h2 class="title">${title}</h2>
      <div class="content">
        ${contentHTML}
        <div class="footer">
          Best Regards,<br>
          Meta Generator Team
        </div>
      </div>
    </div>
  </body>
</html>
`;

const blockedDomains = [
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "temp-mail.org",
  "tempmail.com",
  "yopmail.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "getnada.com",
];

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

const checkAndResetSubscription = async (user: any) => {
  if (user.activePlan && user.planExpireDate && user.planExpireDate.getTime() < Date.now()) {
    // Determine the credits based on the plan (for now we assume 30 for Free, 2000 for Pro etc. We'll just reset to 30 as requested)
    const plan = await SubscriptionPlan.findById(user.activePlan);
    const resetCredits = plan?.name === 'Pro' ? 2000 : plan?.name === 'Agency' ? 999999 : 30;
    
    user.credits = resetCredits;
    user.planExpireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const domain = email.split("@")[1];

  if (blockedDomains.includes(domain) || isDisposableEmail(email)) {
    res.status(400).json({ error: 'Disposable or temporary emails are not allowed. Please use a permanent email address.' });
    return;
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });
    const planExpireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      credits: 30,
      activePlan: freePlan?._id,
      planExpireDate,
      isVerified: false,
      otp,
      otpExpiresAt,
    });

    if (user) {
      try {
        const message = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;
        const html = generateEmailTemplate(
          'Verify your email address',
          `<p>Hi,</p>
           <p>Welcome to Meta Generator! Please enter the following verification code to verify your email address:</p>
           <div class="otp-box">${otp}</div>
           <p>This code will expire in 10 minutes.</p>`
        );
        await sendEmail({
          email: user.email,
          subject: 'Verify your email address - MetaGen AI',
          message,
          html,
        });
        
        res.status(201).json({
          message: 'Registration successful. Please verify your email.',
          email: user.email,
        });
      } catch (error) {
        // If email fails to send, we might want to delete the user or just tell them to resend.
        res.status(201).json({
          message: 'Registration successful, but failed to send verification email. Please try resending the OTP.',
          email: user.email,
        });
      }
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
      res.status(400).json({ error: 'OTP has expired' });
      return;
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      activePlan: user.activePlan,
      planExpireDate: user.planExpireDate,
      hasClaimedWelcomeBonus: user.hasClaimedWelcomeBonus,
      token: generateToken(user._id as unknown as string),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const message = `Your new verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;
    const html = generateEmailTemplate(
      'Verify your email address',
      `<p>Hi,</p>
       <p>Please enter the following new verification code to verify your email address:</p>
       <div class="otp-box">${otp}</div>
       <p>This code will expire in 10 minutes.</p>`
    );
    await sendEmail({
      email: user.email,
      subject: 'Verify your email address - MetaGen AI',
      message,
      html,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('activePlan');

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        // Send a new OTP when they try to login without verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
          const message = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;
          const html = generateEmailTemplate(
            'Verify your email address',
            `<p>Hi,</p>
             <p>Please enter the following verification code to verify your email address before logging in:</p>
             <div class="otp-box">${otp}</div>
             <p>This code will expire in 10 minutes.</p>`
          );
          await sendEmail({
            email: user.email,
            subject: 'Verify your email address - MetaGen AI',
            message,
            html,
          });
        } catch (err) {
          // Ignore email send error here, prompt them to verify
        }

        res.status(403).json({ error: 'Please verify your email address. A new OTP has been sent.', email: user.email, requireOtp: true });
        return;
      }

      await checkAndResetSubscription(user);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        activePlan: user.activePlan,
        planExpireDate: user.planExpireDate,
        token: generateToken(user._id as unknown as string),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email }).populate('activePlan');

    if (!user) {
      // Create user if not exists
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      const freePlan = await SubscriptionPlan.findOne({ name: 'Free' });
      const planExpireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        credits: 30, 
        activePlan: freePlan?._id,
        planExpireDate,
      });
      // Re-fetch to populate plan
      user = await User.findById(user._id).populate('activePlan');
    }

    if (user) {
      await checkAndResetSubscription(user);
    }

    res.json({
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      credits: user?.credits,
      role: user?.role,
      avatar: user?.avatar,
      phone: user?.phone,
      activePlan: user?.activePlan,
      planExpireDate: user?.planExpireDate,
      token: generateToken(user?._id as unknown as string),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during Google Login' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password').populate('activePlan');
    
    if (user) {
      await checkAndResetSubscription(user);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?._id;

  try {
    const user = await User.findById(userId);

    if (!user || !user.password) {
      res.status(404).json({ error: 'User not found or using OAuth' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect current password' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating password' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({ success: false, errorMessages: [{ message: 'There is no user with that email' }] });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // For simple verification we can just store the plain text or hashed.
    // Following user's simpler flow: Just store it hashed for security.
    user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save({ validateBeforeSave: false });

    const message = `Hello,\n\nYour verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nMeta Generator Team`;
    const html = generateEmailTemplate(
      'Reset your password',
      `<p>Hi,</p>
       <p>You have requested to reset your password for your Meta Generator account. Please enter the following verification code to proceed:</p>
       <div class="otp-box">${otp}</div>
       <p>This code will expire in 5 minutes.</p>
       <p>If you did not request a password reset, please ignore this email.</p>`
    );

    console.log(`[DEV] OTP for ${user.email} is ${otp}`);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Verification Code',
        message,
        html,
      });
    } catch (err) {
      console.error('Email sending failed. Please check SMTP settings. OTP is printed in console for dev.');
    }

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, errorMessages: [{ message: 'Server error' }] });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, errorMessages: [{ message: 'User not found' }] });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 5 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const message = `Hello,\n\nYour new verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nMeta Generator Team`;
    const html = generateEmailTemplate(
      'Reset your password',
      `<p>Hi,</p>
       <p>You have requested to reset your password for your Meta Generator account. Please enter the following new verification code to proceed:</p>
       <div class="otp-box">${otp}</div>
       <p>This code will expire in 5 minutes.</p>
       <p>If you did not request a password reset, please ignore this email.</p>`
    );

    console.log(`[DEV] New OTP for ${user.email} is ${otp}`);

    try {
      await sendEmail({
        email: user.email,
        subject: 'New Password Reset Verification Code',
        message,
        html,
      });
    } catch (err) {
      console.error('Email sending failed. Please check SMTP settings. OTP is printed in console for dev.');
    }

    res.status(200).json({ success: true, message: 'OTP resent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, errorMessages: [{ message: 'Server error' }] });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ success: false, errorMessages: [{ message: 'Invalid user details' }] });
      return;
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== hashedOtp ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire.getTime() < Date.now()
    ) {
      res.status(400).json({ success: false, errorMessages: [{ message: 'Invalid or expired OTP' }] });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessages: [{ message: 'Server error' }] });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, errorMessages: [{ message: 'User not found' }] });
      return;
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== hashedOtp ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire.getTime() < Date.now()
    ) {
      res.status(400).json({ success: false, errorMessages: [{ message: 'Invalid or expired OTP' }] });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear the OTP fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessages: [{ message: 'Server error' }] });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, phone } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (req.file) {
      // Configure cloudinary with env vars (which are available here)
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ai-meta-generator/avatars',
      });

      // Remove local file
      fs.unlinkSync(req.file.path);

      user.avatar = result.secure_url;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      token: generateToken(user._id as unknown as string),
    });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: `Server error updating profile: ${error.message || error}` });
  }
};

export const claimWelcomeBonus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.hasClaimedWelcomeBonus) {
      res.status(400).json({ error: 'Welcome bonus has already been claimed' });
      return;
    }

    user.credits += 20;
    user.hasClaimedWelcomeBonus = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      role: user.role,
      activePlan: user.activePlan,
      planExpireDate: user.planExpireDate,
      avatar: user.avatar,
      phone: user.phone,
      hasClaimedWelcomeBonus: user.hasClaimedWelcomeBonus,
      token: generateToken(user._id as unknown as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
