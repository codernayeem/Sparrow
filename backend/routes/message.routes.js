import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  searchUsers,
} from "../controllers/message.controller.js";

const router = express.Router();

// Get all conversations for current user
router.get("/conversations", protectRoute, getConversations);

// Get or create conversation with specific user
router.get("/conversations/:participantId", protectRoute, getOrCreateConversation);

// Get messages for a conversation
router.get("/:conversationId/messages", protectRoute, getMessages);

// Send a message
router.post("/:conversationId/messages", protectRoute, sendMessage);

// Delete a message
router.delete("/messages/:messageId", protectRoute, deleteMessage);

// Search users for messaging
router.get("/search", protectRoute, searchUsers);

export default router;