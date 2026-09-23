import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { User } from '../models/User.model.js';
import { Order } from '../models/Order.model.js';
import { Banner } from '../models/Banner.model.js';
import { StoreSettings } from '../models/StoreSettings.model.js';

const seed = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('ðŸŒ± Connected to MongoDB for Full Seeding...');

    // Clear old collections
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({}),
      Banner.deleteMany({}),
      StoreSettings.deleteMany({}),
    ]);

    // 1. Seed Users (Admin, Driver, Customer)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const driverPassword = await bcrypt.hash('driver123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    const [admin, driver, customer] = await Promise.all([
      User.create({
        name: 'Store Manager',
        phone: '+15550001111',
        email: 'admin@dakotagasstore.com',
        password: adminPassword,
        role: 'admin',
      }),
      User.create({
        name: 'Marcus Vance',
        phone: '+15550002222',
        password: driverPassword,
        role: 'driver',
        driverDetails: {
          vehicle: 'Toyota RAV4 (Plate: DK-782)',
          isAvailable: true,
          activeOrdersCount: 1,
          totalDeliveries: 142,
        },
      }),
      User.create({
        name: 'Emily Watson',
        phone: '+15550003333',
        email: 'emily@example.com',
        password: customerPassword,
        role: 'customer',
        savedAddresses: [
          {
            title: 'Home',
            address: '412 Maple Ridge Rd, Apt 3B',
            postalCode: '58102',
            instructions: 'Leave at front door, ring bell once.',
          },
        ],
      }),
    ]);
    console.log('âœ… Users seeded (Admin, Driver, Customer)');

    // 2. Seed Banners / Promotions (Dakota Spec)
    await Banner.insertMany([
      {
        title: 'Cold Drinks & Snacks Deal',
        subtitle: 'Buy any 2 Energy Drinks & get 20% off chips!',
        imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=1000&auto=format&fit=crop&q=80',
        linkCategory: 'Drinks & Pop',
        discountBadge: '20% OFF',
        order: 1,
      },
      {
        title: 'Campfire & BBQ Specials',
        subtitle: 'Seasoned firewood, coolers & bagged ice delivered to your camp!',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
        linkCategory: 'Firewood & Camp',
        discountBadge: 'BESTSELLER',
        order: 2,
      },
    ]);
    console.log('âœ… Banners seeded');

    // 3. Seed Categories
    const categories = [
      { name: 'Drinks & Pop', iconEmoji: 'ðŸ¥¤', order: 1 },
      { name: 'Energy Drinks', iconEmoji: 'âš¡', order: 2 },
      { name: 'Snacks & Chips', iconEmoji: 'ðŸŸ', order: 3 },
      { name: 'Candy & Chocolate', iconEmoji: 'ðŸ«', order: 4 },
      { name: 'Ice Cream', iconEmoji: 'ðŸ¦', order: 5 },
      { name: 'Automotive & Fluids', iconEmoji: 'ðŸš—', order: 6 },
      { name: 'Ice & Coolers', iconEmoji: 'ðŸ§Š', order: 7 },
      { name: 'Firewood & Camp', iconEmoji: 'ðŸªµ', order: 8 },
      { name: 'Grocery & Essentials', iconEmoji: 'ðŸ›’', order: 9 },
      { name: 'Seasonal Specials', iconEmoji: 'ðŸ”¥', order: 10 },
    ];
    await Category.insertMany(categories);
    console.log('âœ… Categories seeded');

    // 4. Seed Products
    const products = [
      {
        name: 'Red Bull Energy Drink',
        category: 'Energy Drinks',
        price: 3.99,
        salePrice: 3.49,
        unit: '12 fl oz can',
        imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&auto=format&fit=crop&q=60',
        description: 'Vitalizes body and mind. High caffeine formula.',
        inStock: true,
        maxPerOrder: 12,
        isFeatured: true,
        isPopular: true,
      },
      {
        name: 'Coca-Cola Classic Can',
        category: 'Drinks & Pop',
        price: 1.99,
        unit: '355ml can',
        imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&auto=format&fit=crop&q=60',
        description: 'Chilled refreshing classic soda.',
        inStock: true,
        maxPerOrder: 24,
        isFeatured: false,
        isPopular: true,
      },
      {
        name: 'Doritos Nacho Cheese',
        category: 'Snacks & Chips',
        price: 4.79,
        salePrice: 4.29,
        unit: '9.25 oz bag',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60',
        description: 'Bold nacho cheese tortilla chips.',
        inStock: true,
        maxPerOrder: 6,
        isFeatured: true,
        isPopular: true,
      },
      {
        name: 'Premium Seasoned Firewood Bundle',
        category: 'Firewood & Camp',
        price: 8.99,
        unit: 'Bundle (.75 cu ft)',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
        description: 'Dry local hardwood bundle for campfire or hearth.',
        inStock: true,
        maxPerOrder: 4,
        isFeatured: true,
        isPopular: false,
      },
      {
        name: '-20Â°F Windshield Washer Fluid',
        category: 'Automotive & Fluids',
        price: 4.49,
        unit: '1 Gallon',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60',
        description: 'All season de-icer formula leaves glass streak-free.',
        inStock: true,
        maxPerOrder: 3,
        isFeatured: false,
        isPopular: false,
      },
      {
        name: 'Crystal Purified Bagged Ice',
        category: 'Ice & Coolers',
        price: 2.99,
        unit: '7 lb bag',
        imageUrl: 'https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?w=500&auto=format&fit=crop&q=60',
        description: 'Party ice cubes bag.',
        inStock: true,
        maxPerOrder: 5,
        isFeatured: false,
        isPopular: true,
      },
      {
        name: 'Snickers King Size Candy Bar',
        category: 'Candy & Chocolate',
        price: 2.49,
        unit: '3.29 oz',
        imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop&q=60',
        description: 'Milk chocolate, peanuts, caramel and nougat.',
        inStock: true,
        maxPerOrder: 10,
        isFeatured: false,
        isPopular: true,
      },
    ];
    await Product.insertMany(products);
    console.log('âœ… Products seeded');

    // 5. Seed Store Settings (Distance tiers & fees)
    await StoreSettings.create({
      storeName: 'Little Arrows Delivery App',
      storePhone: '+1 (555) 019-2834',
      storeEmail: 'orders@dakotagasstore.com',
      storeAddress: '123 Highway 10, Local Town',
      enableStorePickup: true,
      enablePayAtDoor: true,
      taxRatePercent: 8.5,
      maxDeliveryRadiusKm: 20,
      freeDeliveryThreshold: 50,
      deliveryTiers: [
        { minKm: 0, maxKm: 5, fee: 3.99 },
        { minKm: 5, maxKm: 10, fee: 6.99 },
        { minKm: 10, maxKm: 20, fee: 11.99 },
      ],
      allowedPostalCodes: ['58102', '58103', '58104', '58105', '58109'],
    });
    console.log('âœ… Store Settings & Delivery Tiers seeded');

    // 6. Seed Sample Orders with 6-stage lifecycle
    await Order.create([
      {
        orderNumber: '#GS-10024',
        customer: {
          id: customer._id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          deliveryAddress: '412 Maple Ridge Rd, Apt 3B',
          deliveryInstructions: 'Leave at front door, ring bell once please.',
          distanceKm: 3.4,
        },
        fulfillmentType: 'delivery',
        items: [
          { productId: 'prod-1', name: 'Red Bull Energy Drink', price: 3.49, quantity: 2, totalPrice: 6.98 },
          { productId: 'prod-3', name: 'Doritos Nacho Cheese', price: 4.29, quantity: 1, totalPrice: 4.29 },
        ],
        subtotal: 11.27,
        taxes: 0.96,
        deliveryFee: 3.99,
        tip: 2.5,
        discount: 0,
        total: 18.72,
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
        status: 'received',
      },
      {
        orderNumber: '#GS-10023',
        customer: {
          name: 'James Rodriguez',
          phone: '+15559876543',
          deliveryAddress: '900 Riverside Campgrounds, Lot 14',
          deliveryInstructions: 'Campground entrance gate, call when you arrive.',
          distanceKm: 8.2,
        },
        fulfillmentType: 'delivery',
        items: [
          { productId: 'prod-4', name: 'Premium Seasoned Firewood Bundle', price: 8.99, quantity: 2, totalPrice: 17.98 },
          { productId: 'prod-2', name: 'Coca-Cola Classic Can', price: 1.99, quantity: 6, totalPrice: 11.94 },
        ],
        subtotal: 29.92,
        taxes: 2.54,
        deliveryFee: 6.99,
        tip: 5.0,
        discount: 0,
        total: 44.45,
        paymentMethod: 'pay_at_door',
        paymentStatus: 'unpaid',
        status: 'out_for_delivery',
        assignedDriver: {
          id: driver._id,
          name: driver.name,
          phone: driver.phone,
        },
      },
    ]);
    console.log('âœ… Sample Orders seeded');

    console.log('ðŸŽ‰ FULL SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
