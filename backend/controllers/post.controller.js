import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let img = null;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !req.file) {
      return res
        .status(400)
        .json({ message: "Post must have either text or an image" });
    }

    if (req.file) {
      // Convert buffer to base64 for Cloudinary
      const base64String = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64String, {
        folder: "sparrow",
        resource_type: "image",
      });
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in create post controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
