import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        select: "username fullName profileImg",
      })
      .populate({
        path: "post",
        select: "text img",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Notification.countDocuments({ to: userId });
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log("Error in getNotifications controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const unreadCount = await Notification.countDocuments({ 
      to: userId, 
      read: false 
    });
    
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.log("Error in getUnreadCount controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, to: userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.log("Error in markNotificationAsRead controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { to: userId, read: false },
      { read: true }
    );
    
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.log("Error in markAllNotificationsAsRead controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      to: userId,
    });
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotification controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};