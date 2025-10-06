import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like", "comment", "reply"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      // Only required for like and comment notifications
    },
  },
  { timestamps: true }
);

// Add compound index for better query performance
notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ from: 1, to: 1, type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;