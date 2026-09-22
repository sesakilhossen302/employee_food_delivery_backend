import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  unit: string;
  imageUrl: string;
  description: string;
  inStock: boolean;
  maxPerOrder: number;
  isFeatured: boolean;
  isPopular: boolean;
  options?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    unit: { type: String, default: '1 pc' },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    inStock: { type: Boolean, default: true, index: true },
    maxPerOrder: { type: Number, default: 12 },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);