import express from "express";
import multer from "multer";

import { createPost } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// router.get("/all", protectRoute, getAllPosts);
// router.get("/following", protectRoute, getFollowingPosts);
// router.get("/likes/:id", protectRoute, getLikedPosts);
// router.get("/user/:username", protectRoute, getUserPosts);
router.post(
  "/create",
  protectRoute,
  (req, res, next) => {
    upload.single("img")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  createPost
);
// router.post("/like/:id", protectRoute, likeUnlikePost);
// router.post("/comment/:id", protectRoute, commentOnPost);
// router.delete("/:id", protectRoute, deletePost);

export default router;
