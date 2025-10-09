# Sparrow - Social Media Platform

A modern, full-featured social media platform built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

- **User Authentication**: Complete signup/signin system with JWT  
- **Posts & Feed**: Create, view, like, and comment on posts with image upload  
- **User Profiles**: View and edit profiles, follow/unfollow users  
- **Real-time Messaging**: Socket.io-powered chat system with typing indicators  
- **Notifications**: Live notifications for follows, likes, and comments  
- **People Discovery**: User search and follow suggestions  
- **Responsive Design**: Mobile-first UI built with Tailwind CSS  
- **Dashboard**: Infinite scroll feed with post interactions  

---

## 🧠 Tech Stack

### Frontend
- React 19 + Vite  
- React Router DOM  
- Tailwind CSS 4  
- Socket.io Client  
- Lucide React Icons  

### Backend
- Node.js + Express.js  
- MongoDB + Mongoose  
- JWT Authentication  
- Multer for file uploads  
- Socket.io for real-time features  

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)  
- MongoDB (local or Atlas)  
- npm or yarn  

### 1. Clone the Repository
```bash
git clone https://github.com/codernayeem/Sparrow.git
cd Sparrow
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then open `.env` and configure your settings:
```env
MONGO_URI=mongodb://localhost:27017/sparrow
JWT_SECRET=your_very_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Start the Application

#### Option 1: Run in Development
```bash
# Terminal 1 - Start backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

#### Option 2: Run in Production
```bash
npm run build
npm start
```

### 5. Access the Application
- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:5000/api  

## ✅ Current Implementation Status

### Completed Features
1. **User Registration System**
   - Multi-step signup form with validation
   - Email and password validation
   - Duplicate email prevention  

2. **Authentication & Security**
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - HTTP-only cookies for session tokens  

3. **UI/UX**
   - Modern responsive layout
   - Light mode design
   - Multi-step registration flow  
   - Professional dashboard UI  

4. **Database Integration**
   - MongoDB user model
   - Schema validation
   - Proper connection handling  
