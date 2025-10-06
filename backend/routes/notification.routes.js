import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.get("/unread-count", protectRoute, getUnreadCount);
router.patch("/:id/read", protectRoute, markNotificationAsRead);
router.patch("/read-all", protectRoute, markAllNotificationsAsRead);
router.delete("/:id", protectRoute, deleteNotification);

export default router;