import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkCategory?: string;
  discountBadge?: string;
  isActive: boolean;
  order: number;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String, required: true },
    linkCategory: { type: String },
    discountBadge: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);