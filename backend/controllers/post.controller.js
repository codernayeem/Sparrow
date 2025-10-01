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

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let posts;
    
    // If viewing own profile, show all posts
    if (userId === currentUserId) {
      posts = await Post.find({ user: userId })
        .populate({
          path: "user",
          select: "-password"
        })
        .populate({
          path: "comments.user",
          select: "-password"
        })
        .sort({ createdAt: -1 });
    } else {
      // If viewing another user's profile, only show public posts and posts visible to followers if following
      const isFollowing = user.followers.includes(currentUserId);
      const visibilityFilter = isFollowing 
        ? { $in: ["public", "followers"] }
        : "public";
      
      posts = await Post.find({ 
        user: userId,
        visibility: visibilityFilter
      })
        .populate({
          path: "user",
          select: "-password"
        })
        .populate({
          path: "comments.user",
          select: "-password"
        })
        .sort({ createdAt: -1 });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== userId) {
      return res.status(401).json({ error: "You can only delete your own posts" });
    }

    // Delete image from cloudinary if exists
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`sparrow/${imgId}`);
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id.toString();

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== userId) {
      return res.status(401).json({ error: "You can only edit your own posts" });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Post text cannot be empty" });
    }

    post.text = text;
    await post.save();

    const updatedPost = await Post.findById(id).populate({
      path: "user",
      select: "-password"
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in updatePost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePostVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;
    const userId = req.user._id.toString();

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== userId) {
      return res.status(401).json({ error: "You can only modify your own posts" });
    }

    // Validate visibility value
    if (!["public", "followers", "private"].includes(visibility)) {
      return res.status(400).json({ error: "Invalid visibility value" });
    }

    post.visibility = visibility;
    await post.save();

    const updatedPost = await Post.findById(id).populate({
      path: "user",
      select: "-password"
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in updatePostVisibility controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // page number from frontend
    const limit = parseInt(req.query.limit) || 4; // how many posts per page
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log("Error in get all posts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

