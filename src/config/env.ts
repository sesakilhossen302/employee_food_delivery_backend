import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_station_delivery',
  JWT_SECRET: process.env.JWT_SECRET || 'client_gas_station_delivery_super_jwt_secret_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  STORE_NAME: process.env.STORE_NAME || 'Little Arrows Delivery App',
  STORE_ADDRESS: process.env.STORE_ADDRESS || '123 Highway 10, Local Town',
  STORE_PHONE: process.env.STORE_PHONE || '+1 (555) 019-2834',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
