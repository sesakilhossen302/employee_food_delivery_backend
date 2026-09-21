import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  iconEmoji: string;
  iconUrl?: string;
  bgColorValue?: number;
  isActive: boolean;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    iconEmoji: { type: String, default: '🛒' },
    iconUrl: { type: String },
    bgColorValue: { type: Number, default: 0xFFEBF4FF },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);