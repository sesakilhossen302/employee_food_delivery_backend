# Gas Station & Convenience Store Delivery - Backend API ⚙️ ⛽

Production-ready **Node.js + Express + TypeScript + Socket.io + MongoDB** backend service for Gas Station food, beverage, and convenience store deliveries.

---

## 🌟 Key Features

1. **TypeScript 5+ & Clean Architecture**:
   - Strongly typed models matching Flutter Dart and React TypeScript models.
2. **6-Stage Order Lifecycle Engine**:
   - `received` ➔ `confirmed` ➔ `preparing` ➔ `ready_for_driver` ➔ `out_for_delivery` ➔ `delivered`.
3. **🖨️ Customer Order Packing Slip PDF Generator**:
   - High-resolution PDF generation with store info, order number, customer address, delivery note, itemized items, distance delivery fee, and total cash due.
   - Endpoint: `GET /api/v1/orders/:id/packing-slip`
4. **Real-time Socket.io Gateway**:
   - Instant notifications for incoming orders (`new_order`), status transitions (`order_status_updated`), and driver tracking.
5. **Distance-Tiered Delivery Pricing**:
   - Dynamic delivery fee calculation based on delivery distance (0-5 km, 5-10 km, 10-20 km) with free delivery threshold.
6. **One-Command Demo Seed Script**:
   - Populates categories, products, and store settings instantly.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your MongoDB URI:
```bash
cp .env.example .env
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server (Hot Reload)
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```