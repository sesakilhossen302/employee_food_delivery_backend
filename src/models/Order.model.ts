import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_driver'
  | 'out_for_delivery'
  | 'delivered';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'pay_at_door'
  | 'cash_at_pickup';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sizeOrOption?: string;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    deliveryInstructions?: string;
    distanceKm?: number;
  };
  fulfillmentType: 'delivery' | 'pickup';
  items: IOrderItem[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'unpaid' | 'paid';
  status: OrderStatus;
  assignedDriver?: {
    id: mongoose.Types.ObjectId;
    name: string;
    phone: string;
  };
  estimatedDeliveryMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      deliveryAddress: { type: String, required: true },
      deliveryInstructions: { type: String, default: '' },
      distanceKm: { type: Number, default: 0 },
    },
    fulfillmentType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        sizeOrOption: { type: String },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'pay_at_door', 'cash_at_pickup'],
      default: 'cash_on_delivery',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    status: {
      type: String,
      enum: [
        'received',
        'confirmed',
        'preparing',
        'ready_for_driver',
        'out_for_delivery',
        'delivered',
      ],
      default: 'received',
      index: true,
    },
    assignedDriver: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      phone: { type: String },
    },
    estimatedDeliveryMinutes: { type: Number, default: 25 },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);