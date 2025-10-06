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
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: function () {
        return ["like", "comment", "reply"].includes(this.type);
      },
    },
    message: {
      type: String,
      required: false, // Optional: not all notifications need a message (e.g., follow)
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Indexes for better performance
notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ from: 1, to: 1, type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
