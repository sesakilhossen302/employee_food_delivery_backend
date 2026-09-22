import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, role: user.role, phone: user.phone, name: user.name },
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