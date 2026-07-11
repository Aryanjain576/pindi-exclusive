# 🛍️ Pindi Exclusive — Full-Stack E-Commerce

A production-ready e-commerce platform for **Pindi Exclusive**, a ladies fashion store selling suits and fabrics. Built with the MERN stack (MongoDB, Express, React, Node.js).

---

## 📸 Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based login/signup with bcrypt password hashing |
| 🏠 Homepage | Amazon-style hero banner, category cards, product grid |
| 🛍️ Product Listing | Search, filter by category, sort by price/rating |
| 📦 Product Details | Full page with quantity selector, ratings, description |
| 🛒 Cart System | Add, update, remove items; live subtotal calculation |
| 📱 Responsive | Mobile-first design, works on all screen sizes |
| 🌱 Demo Data | One-click seed button to load 8 sample products |

---

## 🗂️ Project Structure

```
pindi-exclusive/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     ← signup, login, getMe
│   │   ├── productController.js  ← CRUD + seed
│   │   └── cartController.js     ← cart operations
│   ├── middleware/
│   │   └── authMiddleware.js     ← JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js               ← User schema (bcrypt hook)
│   │   ├── Product.js            ← Product schema
│   │   └── Cart.js               ← Cart schema
│   ├── routes/
│   │   ├── auth.js               ← /api/auth/*
│   │   ├── products.js           ← /api/products/*
│   │   └── cart.js               ← /api/cart/*
│   ├── .env                      ← Environment variables
│   ├── package.json
│   └── server.js                 ← Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Header.js + Header.css
        │   ├── ProductCard.js + ProductCard.css
        │   └── Footer.js + Footer.css
        ├── context/
        │   ├── AuthContext.js    ← Global auth state
        │   └── CartContext.js    ← Global cart state
        ├── pages/
        │   ├── HomePage.js + HomePage.css
        │   ├── LoginPage.js
        │   ├── SignupPage.js
        │   ├── AuthPage.css      ← Shared auth styles
        │   ├── ProductDetailPage.js + .css
        │   └── CartPage.js + CartPage.css
        ├── services/
        │   └── api.js            ← Axios API service layer
        ├── App.js                ← Routes + providers
        ├── App.css               ← Global styles + CSS variables
        └── index.js
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- **Node.js** v16 or higher → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community
  - OR use **MongoDB Atlas** (free cloud DB)
- **npm** (comes with Node.js)

---

## 🚀 Setup & Installation

### Step 1 — Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd pindi-exclusive
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3 — Configure Environment Variables

The `.env` file in `/backend` is already pre-configured for local development:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pindi-exclusive
JWT_SECRET=pindi_exclusive_super_secret_jwt_key_2026
NODE_ENV=development
```

> 💡 **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string:
> `MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pindi-exclusive`

### Step 4 — Start the Backend Server

```bash
# From the /backend directory
npm run dev      # With auto-restart (requires nodemon)
# OR
npm start        # Standard start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

### Step 5 — Install Frontend Dependencies

Open a **new terminal window**:

```bash
cd frontend
npm install
```

### Step 6 — Start the React Frontend

```bash
npm start
```

The app will open at **http://localhost:3000** 🎉

---

## 🌱 Loading Demo Products

The database starts empty. To add sample products:

**Option A — In the Browser:**
1. Open http://localhost:3000
2. Click the **"Load Demo Products"** button on the homepage

**Option B — Via API:**
```bash
curl -X POST http://localhost:5000/api/products/seed/init
```

This will create 8 sample products (suits, fabrics, dupattas).

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | Private | Get current user |

**Signup Request Body:**
```json
{
  "name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "password": "mypassword123"
}
```

**Login Request Body:**
```json
{
  "email": "ayesha@example.com",
  "password": "mypassword123"
}
```

---

### Product Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | Get all products |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/seed/init` | Public | Load demo data |

**Query Params for GET /api/products:**
- `?search=lawn` — Search by name/description
- `?category=suits` — Filter by category (suits/fabrics/dupattas)
- `?featured=true` — Featured products only
- `?sort=price-asc` — Sort (price-asc, price-desc, rating)

---

### Cart Endpoints (All require JWT token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update item quantity |
| DELETE | `/api/cart/remove/:productId` | Remove item |
| DELETE | `/api/cart/clear` | Clear entire cart |

---

## 👑 Creating an Admin User

To test admin features (add/delete products via API):

1. Sign up normally through the website
2. Open MongoDB Compass (or Mongo shell)
3. Find your user in the `users` collection
4. Change `role` from `"user"` to `"admin"`

Or via MongoDB shell:
```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS with CSS Variables |
| Fonts | Playfair Display + DM Sans (Google Fonts) |
| State | React Context API |
| HTTP Client | Axios |
| Notifications | React Toastify |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 🛠️ Common Issues & Fixes

**MongoDB connection failed:**
- Make sure MongoDB is running: `mongod` (Mac/Linux) or start MongoDB service (Windows)
- Check your MONGO_URI in `.env`

**"Cannot GET /api/...":**
- Backend server is not running. Start it with `npm run dev` in `/backend`

**React app shows blank page:**
- Frontend dependencies not installed. Run `npm install` in `/frontend`

**CORS errors:**
- The backend has CORS enabled globally. If using different ports, ensure `proxy` in frontend `package.json` matches backend port

**Products not loading:**
- Database is empty. Click "Load Demo Products" button or call the seed endpoint

---

## 🔮 Future Enhancements

- [ ] Checkout flow with address input
- [ ] Payment gateway (JazzCash / EasyPaisa)
- [ ] Product image upload (Cloudinary)
- [ ] Order management system
- [ ] Admin dashboard panel
- [ ] Product reviews & ratings
- [ ] Wishlist feature
- [ ] Email notifications
- [ ] PWA support

---

## 🇵🇰 Made with ❤️ for Pakistan

*Pindi Exclusive — Quality Fashion from the Heart of Rawalpindi*
