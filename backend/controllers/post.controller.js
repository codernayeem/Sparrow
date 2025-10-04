import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

// Helper function to extract mentions from text
const extractMentions = async (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    const user = await User.findOne({ username }).select('_id username fullName');
    if (user) {
      mentions.push(user._id);
    }
  }
  
  return mentions;
};

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
        .populate({
          path: "comments.mentions",
          select: "username fullName profileImg",
        })
        .populate({
          path: "comments.replyTo",
          select: "username fullName profileImg",
        })
        .populate({
          path: "comments.replies.user",
          select: "-password",
        })
        .populate({
          path: "comments.replies.mentions",
          select: "username fullName profileImg",
        })
        .populate({
          path: "comments.replies.replyTo",
          select: "username fullName profileImg",
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
        .populate({
          path: "comments.mentions",
          select: "username fullName profileImg",
        })
        .populate({
          path: "comments.replyTo",
          select: "username fullName profileImg",
        })
        .populate({
          path: "comments.replies.user",
          select: "-password",
        })
        .populate({
          path: "comments.replies.mentions",
          select: "username fullName profileImg",
        })
        .populate({
          path: "comments.replies.replyTo",
          select: "username fullName profileImg",
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

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in get following posts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getDashboardPosts = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch user posts
    const userPosts = await Post.find({ user: currentUserId })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" })
      .populate({ path: "comments.mentions", select: "username fullName profileImg" })
      .populate({ path: "comments.replyTo", select: "username fullName profileImg" })
      .populate({ path: "comments.replies.user", select: "-password" })
      .populate({ path: "comments.replies.mentions", select: "username fullName profileImg" })
      .populate({ path: "comments.replies.replyTo", select: "username fullName profileImg" })
      .sort({ createdAt: -1 });

    // Fetch following posts
    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const followingPosts = await Post.find({ user: { $in: user.following } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" })
      .populate({ path: "comments.mentions", select: "username fullName profileImg" })
      .populate({ path: "comments.replyTo", select: "username fullName profileImg" })
      .populate({ path: "comments.replies.user", select: "-password" })
      .populate({ path: "comments.replies.mentions", select: "username fullName profileImg" })
      .populate({ path: "comments.replies.replyTo", select: "username fullName profileImg" })
      .sort({ createdAt: -1 });

    // Merge posts
    let allPosts = [...userPosts, ...followingPosts];

    // Remove duplicates (by post ID)
    const uniquePostsMap = new Map();
    allPosts.forEach((post) => {
      uniquePostsMap.set(post._id.toString(), post);
    });
    allPosts = Array.from(uniquePostsMap.values());

    // Sort again by createdAt
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedPosts = allPosts.slice(skip, skip + limit);

    res.status(200).json({
      posts: paginatedPosts,
      totalPosts: allPosts.length,
      totalPages: Math.ceil(allPosts.length / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log("Error in getDashboardPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // const notification = new Notification({
      //   from: userId,
      //   to: post.user,
      //   type: "like",
      // });
      // await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Extract mentions from the comment text
    const mentions = await extractMentions(text);

    const comment = {
      user: userId,
      text: text.trim(),
      mentions: mentions
    };

    post.comments.push(comment);
    await post.save();

    // Populate the newly added comment with user details
    const updatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.mentions",
        select: "username fullName profileImg",
      })
      .populate({
        path: "comments.replyTo",
        select: "username fullName profileImg",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.mentions",
        select: "username fullName profileImg",
      })
      .populate({
        path: "comments.replies.replyTo",
        select: "username fullName profileImg",
      });

    // Return the updated comments array
    res.status(200).json(updatedPost.comments);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { text, replyToUserId } = req.body;
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Reply text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Extract mentions from the reply text
    const mentions = await extractMentions(text);

    const reply = {
      user: userId,
      text: text.trim(),
      mentions: mentions,
      replyTo: replyToUserId || comment.user
    };

    comment.replies.push(reply);
    await post.save();

    // Populate the updated post with all necessary details
    const updatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.mentions",
        select: "username fullName profileImg",
      })
      .populate({
        path: "comments.replyTo",
        select: "username fullName profileImg",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.mentions",
        select: "username fullName profileImg",
      })
      .populate({
        path: "comments.replies.replyTo",
        select: "username fullName profileImg",
      });

    // Return the updated comments array
    res.status(200).json(updatedPost.comments);
  } catch (error) {
    console.log("Error in replyToComment controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Query must be at least 2 characters" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username fullName profileImg')
    .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


