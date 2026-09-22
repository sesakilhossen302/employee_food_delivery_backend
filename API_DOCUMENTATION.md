# Gas Station & Delivery App - API Reference Documentation 📑

Base URL: `http://localhost:5000/api/v1` (or local IP for Mobile: `http://10.0.2.2:5000/api/v1`)

---

## 1. Authentication & Profile (`/auth`)

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new customer or driver | `{ name, phone, email, password, role }` |
| `POST` | `/auth/login` | Login with phone & password | `{ phone, password }` |
| `POST` | `/auth/guest-checkout` | Guest mode checkout | `{ name, phone, email, deliveryAddress, deliveryInstructions }` |
| `GET` | `/auth/me` | Get logged-in user profile (Bearer Token) | *None* |
| `POST` | `/auth/address` | Save customer delivery address | `{ title, address, postalCode, instructions }` |
| `GET` | `/auth/address` | Get saved delivery addresses | *None* |

---

## 2. Store Home & Banners (`/store`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/store/home` | Single call returning Store Info, Banners, Categories, Featured & Popular products |
| `GET` | `/store/settings` | Get Store settings (Taxes, Pickup toggle, Pay at Door) |
| `PUT` | `/store/settings` | Update store settings (Admin) |

---

## 3. Categories & Products (`/categories`, `/products`)

| Method | Endpoint | Description | Query / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | List active categories | *None* |
| `POST` | `/categories` | Create category (Admin) | `{ name, iconEmoji, iconUrl }` |
| `GET` | `/products` | List products with filters | `?category=Drinks&search=coke` |
| `POST` | `/products` | Add new product (Admin) | `{ name, category, price, unit, imageUrl, description, inStock }` |
| `PATCH`| `/products/:id/toggle-stock`| Instant **In Stock / Sold Out** switch | *None* |

---

## 4. Delivery Area & Pricing (`/delivery`)

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/delivery/check-area` | Check if location is inside delivery zone | `{ postalCode, distanceKm }` |
| `POST` | `/delivery/calculate-pricing` | Calculate cart preview with tax, tiered delivery fee, tip | `{ items, distanceKm, fulfillmentType, tip }` |

---

## 5. Orders & Packing Slip (`/orders`)

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Place order (Delivery or Pickup, Cash payment) | `{ customer, fulfillmentType, items, tip, paymentMethod }` |
| `GET` | `/orders` | List orders (filters by `?status=`) | *None* |
| `PATCH`| `/orders/:id/status` | Update order stage (`received` ➔ `confirmed` ➔ `preparing` ➔ `ready_for_driver` ➔ `out_for_delivery` ➔ `delivered`) | `{ status: "preparing" }` |
| `PATCH`| `/orders/:id/assign-driver` | Assign driver to order | `{ driverId, driverName, driverPhone }` |
| `GET` | `/orders/:id/packing-slip` | 🖨️ **Download/Stream printable packing slip PDF** | *None* |

---

## 6. Driver Flow (`/driver`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/driver/active-orders` | Get orders assigned to the logged-in driver |
| `PATCH`| `/driver/orders/:id/pickup` | Driver marks order picked up (`out_for_delivery`) |
| `PATCH`| `/driver/orders/:id/complete` | Driver marks delivered & cash collected (`delivered`) |
| `GET` | `/driver/stats` | Driver earnings, completed deliveries |

---

## 7. Admin Dashboard Analytics (`/admin`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | Active orders, preparing count, revenue, sold out items |
| `GET` | `/admin/drivers` | All registered drivers and delivery metrics |

---

## ⚡ Real-Time Socket.io Events

- `new_order` ➔ Emitted to Admin Dashboard when a customer places an order (Audio alert triggers).
- `order_status_updated` ➔ Broadcasted whenever an order advances stage.
- `driver_order_assigned` ➔ Emitted to Driver when an order is assigned.