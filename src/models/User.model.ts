import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'customer' | 'driver' | 'admin' | 'staff';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: UserRole;
  isGuest?: boolean;
  savedAddresses?: Array<{
    title: string;
    address: string;
    postalCode?: string;
    instructions?: string;
  }>;
  driverDetails?: {
    vehicle: string;
    plateNumber?: string;
    isAvailable: boolean;
    activeOrdersCount: number;
    totalDeliveries: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['customer', 'driver', 'admin', 'staff'],
      default: 'customer',
    },
    isGuest: { type: Boolean, default: false },
    savedAddresses: [
      {
        title: { type: String },
        address: { type: String },
        postalCode: { type: String },
        instructions: { type: String },
      },
    ],
    driverDetails: {
      vehicle: { type: String },
      plateNumber: { type: String },
      isAvailable: { type: Boolean, default: true },
      activeOrdersCount: { type: Number, default: 0 },
      totalDeliveries: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);