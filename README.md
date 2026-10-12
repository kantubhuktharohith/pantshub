<<<<<<< HEAD
﻿# GreenCart Documentation

GreenCart is a full-stack e-commerce application built with the MERN stack. It supports customer shopping, cart management, user authentication, seller product management, order placement, and Stripe-based checkout. The project is organized into a `server` backend and a `client` frontend.

This document is written to be practical and end-to-end, so it explains not only the code structure but also the exact product flow from user signup to order completion.

## 1. Project Summary

GreenCart is designed for a simple online sales flow:

- Users register and log in
- Buyers browse products
- Users add or update cart items
- Buyers save shipping addresses
- Users place orders as either COD or Stripe payment
- Sellers can log in and view all incoming orders
- Sellers can update stock and order statuses
- Product reviews are allowed only after a verified purchase

The backend is Node.js + Express and uses MongoDB via Mongoose. The frontend is React + Vite with Tailwind-based styling.

## 2. Project Structure

```text
greencart/
├── client/
│   ├── package.json
│   ├── src/
│   ├── vite.config.js
│   └── ...
├── server/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── server.js
│   └── .env
├── README.md
└── .gitignore
```

### Backend folders

- `server/configs` — database and external service config
- `server/controllers` — business logic for every feature
- `server/middlewares` — authentication middleware for users and sellers
- `server/models` — Mongoose schemas
- `server/routes` — API route registration

### Frontend folders

- `client/src` — React components, pages, API calls, and styling
- Vite handles bundling and development server

## 3. Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- React Hot Toast

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Stripe for payment flow
- Cloudinary + Multer for product image uploads

## 4. Environment Configuration

### Server environment variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greencart
JWT_SECRET=your_super_secure_jwt_secret
SELLER_EMAIL=seller@example.com
SELLER_PASSWORD=your_seller_password

# Cloudinary
=======
# 🛒 GreenCart (MiniCart)

A modern full-stack e-commerce web application built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**. GreenCart delivers a fast, secure, and responsive online shopping experience with customer and seller portals, secure payments, order management, and an intuitive user interface.

---

## 🚀 Features

### 👤 User Features

* Secure JWT-based user authentication
* Persistent login across browser sessions
* Browse products by category
* Search and filter products
* Add, update, and remove items from cart
* Wishlist support
* User profile management
* Save delivery addresses
* Place orders securely
* Amazon-style order tracking timeline
* Order history dashboard
* Mobile-friendly responsive interface

### 🛍️ Seller Features

* Dedicated seller authentication
* Seller dashboard
* Add new products
* Edit existing products
* Delete products
* Upload product images
* Inventory management
* View and manage customer orders
* Track sales performance

### 💳 Payment System

* Secure Stripe Checkout integration
* Online payment support
* Order confirmation after successful payment

### 🖼️ Image Management

* Cloudinary image hosting
* Multer middleware for image uploads
* Optimized product image delivery

### 📱 Responsive UI

* Fully responsive design
* Desktop, tablet, and mobile support
* Clean and modern shopping experience
* Built using Tailwind CSS

---

# 🛠️ Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS 4
* React Router v7
* Axios
* React Hot Toast

## Backend

* Node.js
* Express.js 5
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* Bcrypt.js

## Third-Party Services

* Stripe
* Cloudinary
* Multer

---

# 📂 Project Structure

```text
GreenCart/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/greencart.git

cd greencart
```

---

## Install Backend Dependencies

```bash
cd server

npm install
```

---

## Install Frontend Dependencies

```bash
cd ../client

npm install
```

---



<<<<<<< HEAD
## 5. Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/your-username/greencart.git
cd greencart
```

### Step 2: Install backend dependencies

```bash
cd server
npm install
```

### Step 3: Install frontend dependencies

```bash
cd ../client
npm install
```

### Step 4: Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### Step 5: Start backend

```bash
cd server
npm run server
```

### Step 6: Start frontend

```bash
cd client
npm run dev
```

The frontend usually runs on `http://localhost:5173` and the backend on `http://localhost:5000` (or configured `PORT`).

## 6. Backend Architecture

### Server boot flow

The main Express app is initialized in `server/server.js`.

Important pieces:

- Connects to MongoDB using `connectDB()`
- Connects Cloudinary via `connectCloudinary()`
- Enables CORS with frontend origins
- Uses cookie parser for JWT-based auth
- Exposes the Stripe webhook endpoint at `/stripe`
- Registers API routes under `/api`

### Core route mapping

| Module | Base path | Purpose |
|---|---|---|
| User | `/api/user` | Registration, login, profile, auth checks |
| Seller | `/api/seller` | Seller login/logout and auth |
| Product | `/api/product` | Product listing, creation, stock updates, reviews |
| Cart | `/api/cart` | Persist cart updates |
| Address | `/api/address` | Save and fetch addresses |
| Order | `/api/order` | Place orders, fetch orders, update status |

## 7. Authentication Model

There are two separate authentication flows:

### User auth

- User logs in with email and password
- Backend hashes password using `bcryptjs`
- JWT token is generated using `JWT_SECRET`
- Token is saved in cookies as `token`
- Protected routes use `authUser` middleware

### Seller auth

- Seller logs in using `SELLER_EMAIL` and `SELLER_PASSWORD`
- JWT token is created and stored in cookie `sellerToken`
- Protected seller routes use `authSeller` middleware

The auth middleware reads cookies or request headers and injects `userId` into `req.body` for downstream logic.

## 8. Database Models

### User model

File: `server/models/User.js`

Fields:

- `name`
- `email` (unique)
- `password`
- `phone`
- `location`
- `cartItems` (object storing cart state)

### Product model

File: `server/models/Product.js`

Fields:

- `name`
- `description` (array)
- `price`
- `offerPrice`
- `image` (array of URLs)
- `category`
- `inStock`
- `reviews` (embedded review array)

### Address model

File: `server/models/Address.js`

Fields:

- `userId`
- `firstName`
- `lastName`
- `email`
- `street`
- `city`
- `state`
- `zipcode`
- `country`
- `phone`

### Order model

File: `server/models/Order.js`

Fields:

- `userId`
- `items` = array of `{ product, quantity }`
- `amount`
- `address`
- `status` with default `Order Placed`
- `paymentType` (`COD` or `Online`)
- `isPaid` default false
- timestamps for order creation and updates

## 9. Request and Response Overview

### 9.1 User APIs

#### Register user

- Method: `POST`
- Route: `/api/user/register`
- Body:

```json
{
  "name": "Aman",
  "email": "aman@example.com",
  "password": "secret123"
}
```

#### Login user

- Method: `POST`
- Route: `/api/user/login`
- Body:

```json
{
  "email": "aman@example.com",
  "password": "secret123"
}
```

#### Check user auth

- Method: `GET`
- Route: `/api/user/is-auth`
- Auth: required

#### Update profile

- Method: `PUT`
- Route: `/api/user/profile`
- Auth: required
- Body:

```json
{
  "name": "Aman Singh",
  "phone": "9876543210",
  "location": "Hyderabad"
}
```

#### Logout user

- Method: `GET`
- Route: `/api/user/logout`
- Auth: required

### 9.2 Seller APIs

#### Seller login

- Method: `POST`
- Route: `/api/seller/login`
- Body:

```json
{
  "email": "seller@example.com",
  "password": "secretSellerPassword"
}
```

#### Seller auth check

- Method: `GET`
- Route: `/api/seller/is-auth`
- Auth: required

#### Seller logout

- Method: `GET`
- Route: `/api/seller/logout`

### 9.3 Product APIs

#### Add product

- Method: `POST`
- Route: `/api/product/add`
- Auth: seller
- Accepts multipart form-data with uploaded images and a `productData` field containing JSON product data

Example product payload:

```json
{
  "name": "Organic Cotton T-Shirt",
  "description": ["Soft material", "100% cotton"],
  "price": 899,
  "offerPrice": 699,
  "category": "Fashion",
  "inStock": true
}
```

#### List products

- Method: `GET`
- Route: `/api/product/list`

#### Get product by ID

- Method: `GET`
- Route: `/api/product/id`
- Request body should contain `id`

#### Update stock

- Method: `POST`
- Route: `/api/product/stock`
- Auth: seller
- Body:

```json
{
  "id": "product_id",
  "inStock": false
}
```

#### Add review

- Method: `POST`
- Route: `/api/product/review`
- Auth: user
- Body:

```json
{
  "productId": "product_id",
  "rating": 5,
  "comment": "Excellent quality"
}
```

Important rule: review is only allowed if the user has purchased the product before.

### 9.4 Address APIs

#### Add address

- Method: `POST`
- Route: `/api/address/add`
- Auth: user
- Body:

```json
{
  "address": {
    "firstName": "Aman",
    "lastName": "Sharma",
    "email": "aman@example.com",
    "street": "12 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zipcode": 560001,
    "country": "India",
    "phone": "9876543210"
  }
}
```

#### Get addresses

- Method: `GET`
- Route: `/api/address/get`
- Auth: user

### 9.5 Cart APIs

#### Update cart

- Method: `POST`
- Route: `/api/cart/update`
- Auth: user
- Body:

```json
{
  "cartItems": {
    "product_id_1": { "quantity": 2 },
    "product_id_2": { "quantity": 1 }
  }
}
```

### 9.6 Order APIs

#### Place COD order

- Method: `POST`
- Route: `/api/order/cod`
- Auth: user
- Body:

```json
{
  "items": [
    { "product": "product_id", "quantity": 2 }
  ],
  "address": "address_id",
  "userId": "user_id"
}
```

This action:

- validates address and cart items
- calculates total amount
- adds a 2% tax
- creates a new order record with `paymentType: "COD"`
- clears the user cart

#### Place Stripe order

- Method: `POST`
- Route: `/api/order/stripe`
- Auth: user
- Body:

```json
{
  "items": [
    { "product": "product_id", "quantity": 1 }
  ],
  "address": "address_id"
}
```

This action:

- calculates item price + tax
- creates a pending order immediately
- creates a Stripe checkout session
- returns a payment URL to the frontend

#### Stripe webhook

- Method: `POST`
- Route: `/stripe`
- Purpose: verifies Stripe payment success and updates order state

When the Stripe payment succeeds:

- order is marked `isPaid: true`
- cart is cleared

When the payment fails:

- the order is deleted

#### User orders

- Method: `GET`
- Route: `/api/order/user`
- Auth: user

#### Seller all orders

- Method: `GET`
- Route: `/api/order/seller`
- Auth: seller

#### Update order status

- Method: `POST`
- Route: `/api/order/status`
- Auth: seller
- Body:

```json
{
  "orderId": "order_id",
  "status": "Shipped"
}
```

#### Cancel order

- Method: `POST`
- Route: `/api/order/cancel`
- Auth: user
- Body:

```json
{
  "orderId": "order_id",
  "userId": "user_id"
}
```

Only orders with status `Order Placed` can be cancelled.

## 10. Pin-to-Pin Customer Flow

This is the end-to-end workflow the app follows.

### Step 1: User registers

- Frontend sends `POST /api/user/register`
- Backend validates fields
- Password is hashed using bcrypt
- JWT is generated and stored in a cookie
- Response includes user profile info

### Step 2: User browses products

- Frontend calls `GET /api/product/list`
- The server returns all products with pricing and stock info

### Step 3: User adds products to cart

- Frontend updates user cart using `POST /api/cart/update`
- Cart is saved in the `User.cartItems` object

### Step 4: User saves shipping address

- Frontend calls `POST /api/address/add`
- Address is stored in the `Address` collection and linked to the user

### Step 5: User chooses a payment method

- Cash on Delivery (COD) or Stripe checkout

### Step 6A: COD flow

- `POST /api/order/cod`
- Validates request
- Calculates total with 2% tax
- Creates order record
- Clears cart

### Step 6B: Stripe flow

- `POST /api/order/stripe`
- Creates order in `pending` style with payment info
- Creates Stripe checkout session
- Returns payment URL
- User pays on Stripe
- Webhook updates order payment status and clears cart

### Step 7: Order status tracking

- Seller uses `/api/order/seller` to view all orders
- Seller updates the order status with `/api/order/status`
- Users can see their order history via `/api/order/user`

## 11. Seller Workflow

The seller workflow is designed for an operational dashboard:

- Seller logs in with official credentials from environment variables
- Seller adds products with image uploads
- Seller updates product stock
- Seller sees all user orders
- Seller changes order status such as `Order Placed`, `Packed`, `Shipped`, `Delivered`, etc.

This separation is enforced by `authSeller` middleware, which restricts seller-only actions.

## 12. File-by-File Logic Summary

### `server/server.js`

Main entry point for the backend. Configures Express, CORS, DB, Cloudinary, routes, and the Stripe webhook.

### `server/controllers/orderController.js`

Contains all order business logic:

- COD order placement
- Stripe order placement
- Stripe webhook verification
- Fetching user orders
- Fetching seller orders
- Status updates
- Cancellation rules

This controller is the most important file for the transaction lifecycle.

### `server/middlewares/authUser.js`

Validates user JWT tokens and sets `req.body.userId` before route handlers run.

### `server/middlewares/authSeller.js`

Validates seller token and protects seller-only endpoints.

### `server/models/*.js`

Define the MongoDB schema and the object structure used across the application.

## 13. Security Notes

The project uses a basic but workable security pattern for a learning or MVP application:

- Password hashing with `bcryptjs`
- JWT for authenticated routes
- Cookie-based tokens
- Seller credentials defined in environment variables
- Stripe webhook validation using `stripe-signature`

Additional production improvements that would be recommended:

- Validate all request data at the controller layer
- Add rate limiting
- Add strict input sanitization
- Add admin role management
- Move uploaded image handling to a dedicated storage pipeline

## 14. Deployment Guidance

This project is ready to be deployed on services like Vercel or Railway.

### Backend deployment

- Set all required environment variables in production
- Set `FRONTEND_URL` to the live frontend origin
- Ensure MongoDB is reachable from deployment
- Ensure Stripe webhook endpoint is configured with production URL

### Frontend deployment

- Set `VITE_API_URL` to the backend domain
- Run `npm run build`
- Deploy static build output from Vite

## 15. Common Troubleshooting

### Error: MongoDB connection fails

- Check that `MONGODB_URI` is valid
- Ensure MongoDB is running
- Confirm network access for Atlas-hosted database

### Error: Stripe webhook not working

- Ensure the webhook secret is configured
- Use the correct callback route
- Confirm request body is raw JSON for `/stripe`

### Error: login or auth fails

- Check `JWT_SECRET`
- Confirm cookies are allowed in browser
- Ensure browser is not blocking third-party cookies or cross-site cookie behaviors

### Products not uploading images

- Confirm Cloudinary credentials are set correctly
- Ensure `multer` is receiving uploaded files

## 16. Suggested Improvements

Even though the app works as a lean e-commerce project, the following upgrades would improve it:

- Add pagination for product and order listing
- Add search and category filtering for products
- Add order status timeline/history per order
- Add admin and seller role separation
- Add payment verification and retries
- Add a dedicated API validation layer
- Add tests for all critical flows

## 17. Final Summary

GreenCart is a compact but complete e-commerce backend/frontend project with clear separation between customer, seller, and payment modules. The key value of the project is its end-to-end flow:

- user auth
- product catalog
- cart persistence
- address management
- COD and Stripe payment checkout
- seller order management
- order status updates

If you are working on this project, the most important files to understand first are:

- `server/server.js`
- `server/controllers/orderController.js`
- `server/controllers/userController.js`
- `server/controllers/productController.js`
- `server/models/Order.js`
- `server/routes/orderRoute.js`

This project is a strong example of a MERN-based ecommerce app with real transaction handling and payment integration.
=======
---

# ▶️ Running the Project

## Start Backend

```bash
cd server

npm run server
```

---

## Start Frontend

```bash
cd client

npm run dev
```

---

# 🌍 Deployment

GreenCart can be deployed on platforms such as **Vercel**, **Render**, or **Railway**.

Before deployment:

* Configure all environment variables.
* Update CORS settings for production.
* Build the frontend using:

```bash
npm run build
```

---

# 🔒 Security

* JWT Authentication
* Password hashing using Bcrypt
* Protected API routes
* Secure payment gateway with Stripe
* Environment variable protection

---

# 📸 Screenshots

Add screenshots of the following pages:

* Home Page
* Product Listing
* Product Details
* Shopping Cart
* Checkout
* User Dashboard
* Order Tracking
* Seller Dashboard
* Admin Product Management

---

# 🎯 Future Improvements

* Product reviews and ratings
* AI-based product recommendations
* Coupon and discount system
* Email notifications
* Live order tracking
* Multi-vendor marketplace
* Dark mode
* Progressive Web App (PWA)
* Inventory analytics dashboard
* Admin panel with detailed reports

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

** Rohith Kantubhuktha **

Frontend Developer | MERN Stack Developer | React Developer

If you found this project useful, consider giving it a ⭐ on GitHub.
>>>>>>> 9bc26e7d3a7511960ea69d121d99395aa9547f35
