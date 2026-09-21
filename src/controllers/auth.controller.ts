import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { ENV } from '../config/env.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, password, role } = req.body;
    const existing = await User.findOne({ phone });
    if (existing) {
      res.status(400).json({ success: false, message: 'Phone number already registered' });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    const token = jwt.sign({ id: user._id, role: user.role, phone: user.phone }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (password && user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role, phone: user.phone }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};