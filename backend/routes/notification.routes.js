import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications (paginated)
router.get("/", protectRoute, getNotifications);

// Get unread notification count
router.get("/unread-count", protectRoute, getUnreadCount);

// Mark a single notification as read
router.patch("/:id/read", protectRoute, markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", protectRoute, markAllNotificationsAsRead);

// Delete a single notification
router.delete("/:id", protectRoute, deleteNotification);

// Delete all notifications
router.delete("/", protectRoute, deleteNotifications);

export default router;
