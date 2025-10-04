import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        mentions: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }],
        replyTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        parentComment: {
          type: mongoose.Schema.Types.ObjectId,
        },
        replies: [{
          text: {
            type: String,
            required: true,
          },
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          mentions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          }],
          replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        }],
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
