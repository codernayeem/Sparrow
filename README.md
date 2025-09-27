# Sparrow - Social Media Platform

A modern social media platform built with React, Node.js, Express, and MongoDB.

## Features

- ✅ User Registration (Sign Up)
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Dashboard with User Profile
- ✅ Responsive Design (Light Mode)
- 📋 Sign In (Placeholder - Not Implemented)
- 📋 Posts/Feed (Not Implemented)
- 📋 User Profiles (Not Implemented)

## Tech Stack

**Frontend:**
- React 19
- React Router DOM
- Tailwind CSS
- Vite

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/codernayeem/Sparrow.git
cd Sparrow
\`\`\`

### 2. Environment Setup
Create a \`.env\` file in the root directory:
\`\`\`bash
cp .env.example .env
\`\`\`

Update the \`.env\` file with your configuration:
\`\`\`env
MONGO_URI=mongodb://localhost:27017/sparrow
JWT_SECRET=your_very_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=development
\`\`\`

### 3. Install Dependencies
\`\`\`bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
\`\`\`

### 4. Start the Application

**Option 1: Start both frontend and backend separately**
\`\`\`bash
# Terminal 1 - Start backend server
npm run dev

# Terminal 2 - Start frontend dev server
cd frontend
npm run dev
\`\`\`

**Option 2: Use the build command (production)**
\`\`\`bash
npm run build
npm start
\`\`\`

### 5. Access the Application
- Frontend: http://localhost:5173 (development) or http://localhost:5000 (production)
- Backend API: http://localhost:5000/api

## Available Routes

### Frontend Routes
- \`/\` - Home page
- \`/signup\` - User registration
- \`/signin\` - Sign in (placeholder)
- \`/dashboard\` - User dashboard (protected)

### Backend API Routes
- \`POST /api/auth/signup\` - User registration
- \`POST /api/auth/login\` - User login (implemented but no frontend)
- \`POST /api/auth/logout\` - User logout
- \`GET /api/auth/me\` - Get current user (protected)

## Current Implementation Status

### ✅ Completed Features
1. **User Registration System**
   - Multi-step signup form with validation
   - Email format validation
   - Password strength requirements
   - Duplicate email prevention

2. **Authentication & Security**
   - JWT token-based authentication
   - Secure password hashing with bcrypt
   - HTTP-only cookies for token storage
   - Protected routes middleware

3. **User Interface**
   - Modern, responsive design
   - Light mode theme throughout
   - Multi-step registration flow
   - Professional dashboard layout
   - Brand logo integration

4. **Database Integration**
   - MongoDB user model
   - Proper schema validation
   - Connection handling

### 📋 Placeholder Features
- Sign In functionality (backend exists, frontend is placeholder)
- User profiles and bio management
- Posts and feed system
- Following/followers system

## File Structure
\`\`\`
Sparrow/
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── db/
│   │   └── connectMongoDB.js
│   ├── lib/
│   │   └── utils/
│   │       └── generateToken.js
│   ├── middleware/
│   │   └── protectRoute.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   └── login/
│   │   │   ├── home/
│   │   │   └── dashboard/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│       └── logo.png
├── package.json
└── .env.example
\`\`\`

## Contributing
This is a feature branch focusing on the signup functionality. Future features like sign-in, posts, and user profiles can be implemented in separate branches.

## License
ISC License