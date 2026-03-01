# 🛒 Rezell

> **"Re-use. Re-sell. Rezell."**
> A **college-exclusive** platform where students can **buy and sell** second-hand books, gadgets, and furniture — securely, locally, and with trust.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 📌 Table of Contents

- [About Rezell](#-about-rezell)
- [Problem Statement](#-problem-statement)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Design](#-system-design)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🧠 About Rezell

**Rezell** is a college-exclusive digital platform designed to solve a real student problem — unstructured, unsafe, and untrustworthy buying/selling through WhatsApp groups and hostel notice boards.

> OLX for your campus. But smarter, safer, and built for students.

This is **not just a CRUD application** — it is a **behaviour-driven, trust-centric system design project** where every feature reflects how students actually operate in real life.

---

## ❗ Problem Statement

Students today rely on:
- WhatsApp groups
- Hostel notice boards
- Personal DMs

### Problems with current approach:
| Problem | Impact |
|--------|--------|
| ❌ No identity verification | Scams & fake sellers |
| ❌ No structure or search | Time waste |
| ❌ Old/expired posts | Confusion & clutter |
| ❌ Outsiders can access | Unsafe transactions |
| ❌ No local focus | Items like furniture can't be sold far |

**Solution:** A structured, campus-exclusive, trust-first marketplace — **Rezell**.

---

## ✨ Core Features

### 🔐 Campus-Only Authentication
- College email based registration
- Domain extraction for campus isolation (`@pccoe.edu.in` → `pccoe`)
- Outsiders automatically blocked
- Each college = independent community

### 📦 Product Listings
- Categories: **Books | Gadgets | Furniture**
- Condition tags: New / Like New / Good / Fair
- Negotiable pricing support
- Image upload with pickup location
- Auto-tagged to seller's college

### 💬 Real-Time Chat & Negotiation
- In-app messaging powered by **Socket.io**
- Price discussion & pickup coordination
- No personal contact info exposed

### ⭐ Seller Rating System
- Rating only unlocked after real transaction
- One listing = one rating (no duplicates)
- Self-rating impossible
- Fake rating prevention via behaviour checks

### ⏳ Listing Lifecycle Management
```
Active → Sold / Expired / Deleted → Archived
```
- Auto-expiry to prevent clutter
- History preserved for trust records

### 🎓 Pass-Out Student Handling
| State | Permissions |
|-------|-------------|
| Active Student | Buy + Sell |
| Pass-Out (Grace Period) | Sell Only |
| Expired Alumni | Account Archived |

### 🏫 Multi-College Scalability
- One platform, multiple college communities
- Listings visible only within same campus
- Critical for furniture & local items

---

## 💳 Payment Philosophy

> **No forced in-app payment — intentionally.**

Students on the same campus prefer:
- 💵 Cash on pickup
- 📱 Direct UPI transfer

**Rezell** provides **discovery + trust**, not payment processing.
This is a **design maturity decision**, not a limitation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, Bcrypt |
| **Real-Time** | Socket.io |
| **File Upload** | Cloudinary + Multer |
| **Deployment** | Vercel (FE) + Render (BE) + MongoDB Atlas |

---

## 🗺️ System Design

### Auth & Campus Isolation Flow
```
Register with college email
        ↓
Extract domain → Save as "college" field
        ↓
JWT issued with { userId, college }
        ↓
Every API request → collegeCheck middleware
        ↓
User sees ONLY their college's listings ✅
```

### Buying Flow
```
Login → Browse → Filter → Check Seller
→ Chat → Negotiate → Meet → Pay → Rate Seller
```

### Selling Flow
```
Login → Create Listing → Manage Chats
→ Sell → Mark as Sold → Receive Rating
```

---

## 📁 Project Structure

```
rezell/
│
├── client/                        # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/
│   │   ├── context/               # Auth Context (React Context API)
│   │   └── App.jsx
│
├── server/                        # Express Backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   └── Rating.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── chat.js
│   │   └── ratings.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── collegeCheck.js
│   ├── socket/
│   │   └── socketHandler.js
│   └── server.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Guru54hii/rezell.git
cd rezell

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install

# 4. Setup environment variables (see below)

# 5. Run the development servers

# In /server
npm run dev

# In /client
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `/server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

---

## 📡 API Overview

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register with college email |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/verify-email/:token` | Email verification |

### Listings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/listings` | Get campus-filtered listings |
| POST | `/api/listings` | Create new listing |
| GET | `/api/listings/:id` | Get listing detail |
| PUT | `/api/listings/:id` | Update listing (owner only) |
| DELETE | `/api/listings/:id` | Delete listing (owner only) |
| PATCH | `/api/listings/:id/sold` | Mark as sold |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat/start` | Start chat on a listing |
| GET | `/api/chat/my-chats` | Get all user chats |
| GET | `/api/chat/:chatId` | Get chat messages |

### Ratings
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ratings` | Submit rating after sale |
| GET | `/api/ratings/:userId` | Get seller's ratings |

---

## 🗓️ Roadmap

- [x] Project planning & system design
- [x] Project named **Rezell** 🎉
- [ ] **Phase 1** – Auth + College Isolation + JWT
- [ ] **Phase 2** – Listing CRUD + Image Upload + Campus Filter
- [ ] **Phase 3** – Real-Time Chat (Socket.io) + Seller Ratings
- [ ] **Phase 4** – Auto-expiry (Cron Job) + Pass-out Logic + Admin Panel
- [ ] **Phase 5** – Deployment (Vercel + Render + Atlas)

---

## 🎯 Interview-Ready Summary

> *"Rezell is a college-exclusive reselling platform built to replace unstructured WhatsApp-based buying and selling among students. The system focuses on trust, negotiation, and local pickup by enabling chat-based price discussion, seller ratings tied to real transactions, and campus-restricted visibility. Payments are intentionally kept offline to reflect real student behaviour, making Rezell practical, scalable, and trust-driven."*

---

## 👨‍💻 Author

**Gurudas**
- 🎓 Computer Engineering Student
- 💼 MERN Stack Developer
- 🔗 [GitHub](https://github.com/Guru54hii)

---

## 📄 License

This project is licensed under the **MIT License**.

---

> ⭐ If you find Rezell useful, consider giving it a star!