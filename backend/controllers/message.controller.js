import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "username fullName profileImg",
        match: { _id: { $ne: userId } }, // Exclude current user
      })
      .populate({
        path: "lastMessage",
        select: "content messageType createdAt sender",
        populate: {
          path: "sender",
          select: "username fullName",
        },
      })
      .sort({ lastActivity: -1 });

    // Filter out conversations where participants is empty (can happen with populate match)
    const filteredConversations = conversations.filter(
      (conv) => conv.participants.length > 0
    );

    res.status(200).json(filteredConversations);
  } catch (error) {
    console.log("Error in getConversations controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get or create a conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { participantId } = req.params;

    // Check if the other user exists
    const otherUser = await User.findById(participantId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't allow conversation with self
    if (userId.toString() === participantId) {
      return res.status(400).json({ error: "Cannot create conversation with yourself" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate({
        path: "participants",
        select: "username fullName profileImg",
        match: { _id: { $ne: userId } },
      })
      .populate({
        path: "lastMessage",
        select: "content messageType createdAt sender",
        populate: {
          path: "sender",
          select: "username fullName",
        },
      });

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, participantId],
      });
      await conversation.save();

      // Populate the newly created conversation
      conversation = await Conversation.findById(conversation._id)
        .populate({
          path: "participants",
          select: "username fullName profileImg",
          match: { _id: { $ne: userId } },
        })
        .populate({
          path: "lastMessage",
          select: "content messageType createdAt sender",
          populate: {
            path: "sender",
            select: "username fullName",
          },
        });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in getOrCreateConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found or access denied" });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate({
        path: "sender",
        select: "username fullName profileImg",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    // Mark messages as read by current user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        "readBy.user": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      }
    );

    const totalMessages = await Message.countDocuments({ conversation: conversationId });

    res.status(200).json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { content, messageType = "text", imageUrl } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Message content cannot be empty" });
    }

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found or access denied" });
    }

    // Create new message
    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      messageType,
      imageUrl,
      readBy: [
        {
          user: userId,
          readAt: new Date(),
        },
      ],
    });

    await newMessage.save();

    // Update conversation's last message and activity
    conversation.lastMessage = newMessage._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate sender info before sending response
    await newMessage.populate({
      path: "sender",
      select: "username fullName profileImg",
    });

    // Get the Socket.IO instance and emit to conversation room
    const io = req.app.get("io");
    if (io) {
      console.log(`Emitting newMessage to room: ${conversationId}`);
      io.to(conversationId).emit("newMessage", newMessage);
      
      // Also emit conversation update for real-time conversation list updates
      const updatedConversation = await Conversation.findById(conversationId)
        .populate({
          path: "participants",
          select: "username fullName profileImg",
        })
        .populate({
          path: "lastMessage",
          select: "content messageType createdAt sender",
          populate: {
            path: "sender",
            select: "username fullName",
          },
        });
      
      if (updatedConversation) {
        console.log(`Emitting conversationUpdated to room: ${conversationId}`);
        io.to(conversationId).emit("conversationUpdated", updatedConversation);
      }
    } else {
      console.warn("Socket.IO instance not found");
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is the sender of the message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    // Get the Socket.IO instance and emit to conversation room
    const io = req.app.get("io");
    if (io) {
      io.to(message.conversation.toString()).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search for users to start a conversation
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { fullName: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
      .select("username fullName profileImg")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};