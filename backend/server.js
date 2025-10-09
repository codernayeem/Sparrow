import express, { json } from "express";
import { config } from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectMongoDB from "./db/connectMongoDB.js";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.routes.js";
import messageRoutes from "./routes/message.routes.js";

// Load environment variables from .env file
config();

// Cloudinary setup
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Make io instance available to other parts of the app
app.set("io", io);

// Socket.IO connection handling
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user authentication and room joining
  socket.on("authenticate", (userId) => {
    if (userId) {
      // Remove user from any previous socket connections
      for (const [uid, socketId] of activeUsers.entries()) {
        if (uid === userId && socketId !== socket.id) {
          activeUsers.delete(uid);
        }
      }
      
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    }
  });

  // Join conversation room
  socket.on("joinConversation", (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    }
  });

  // Leave conversation room
  socket.on("leaveConversation", (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    }
  });

  // Handle typing indicators
  socket.on("typing", ({ conversationId, isTyping }) => {
    if (conversationId && socket.userId) {
      socket.to(conversationId).emit("userTyping", {
        userId: socket.userId,
        isTyping,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected (${reason})`);
    }
    console.log("User disconnected:", socket.id);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

// post routes
app.use("/api/posts", postRoutes);

// test route
app.get("/test", (req, res) => {
  res.send("API is running...");
});


if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB();
});
