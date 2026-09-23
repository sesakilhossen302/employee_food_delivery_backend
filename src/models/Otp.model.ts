import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    purpose: { type: String, default: 'login' },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto delete after 5 minutes
  },
  { timestamps: true }
);

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);