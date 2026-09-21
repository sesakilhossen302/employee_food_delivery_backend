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
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);