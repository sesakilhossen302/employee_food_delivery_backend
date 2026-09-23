import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model.js';
import { Otp } from '../models/Otp.model.js';
import { sendOtpEmail } from '../services/mail.service.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, role: user.role, phone: user.phone, name: user.name, email: user.email },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );
};

// Customer / Driver Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Name and phone are required' });
      return;
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      res.status(400).json({ success: false, message: 'This phone number is already registered' });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: role || 'customer',
      isGuest: false,
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Phone / Password Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    const user = await User.findOne({ phone });
    if (!user) {
      res.status(401).json({ success: false, message: 'No account found with this phone number' });
      return;
    }

    if (password && user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ success: false, message: 'Incorrect password' });
        return;
      }
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP to Gmail
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, purpose } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required to send OTP' });
      return;
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Clear any previous pending OTP for this email & purpose
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: purpose || 'login' });

    // Save new OTP
    await Otp.create({
      email: email.toLowerCase(),
      otp: otpCode,
      purpose: purpose || 'login',
      expiresAt,
    });

    // Send email via Gmail
    await sendOtpEmail(email, otpCode, purpose || 'Verification');

    res.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
      data: {
        email,
        expiresInSeconds: 300,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const record = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.toString().trim(),
      purpose: purpose || 'login',
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: record._id });

    // Check if user exists with this email
    let user = await User.findOne({ email: email.toLowerCase() });
    let token = '';

    if (user) {
      token = generateToken(user);
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        isUserRegistered: !!user,
        user,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password (Send OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: 'No user registered with this email address' });
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'forgot_password' });
    await Otp.create({
      email: email.toLowerCase(),
      otp: otpCode,
      purpose: 'forgot_password',
      expiresAt,
    });

    await sendOtpEmail(email, otpCode, 'Password Reset');

    res.json({
      success: true,
      message: `Password reset OTP sent to ${email}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password with OTP
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, OTP, and newPassword are required' });
      return;
    }

    const record = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.toString().trim(),
      purpose: 'forgot_password',
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset OTP' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await Otp.deleteOne({ _id: record._id });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Guest Checkout (Dakota Spec requirement)
export const guestCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, deliveryAddress, deliveryInstructions } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Name and phone are required for guest checkout' });
      return;
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name,
        phone,
        email,
        role: 'customer',
        isGuest: true,
        savedAddresses: deliveryAddress
          ? [{ title: 'Delivery Address', address: deliveryAddress, instructions: deliveryInstructions }]
          : [],
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Guest checkout session initiated',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Current User Profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save Customer Delivery Address
export const addSavedAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, address, postalCode, instructions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.savedAddresses) {
      user.savedAddresses = [];
    }

    user.savedAddresses.push({ title, address, postalCode, instructions });
    await user.save();

    res.json({ success: true, message: 'Address saved successfully', data: user.savedAddresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Saved Addresses
export const getSavedAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    res.json({ success: true, data: user?.savedAddresses || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};