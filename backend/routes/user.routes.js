import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfileImage,
  searchUsers,
  followUnfollowUser,
  getSuggestedUsers 
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:email", protectRoute, getUserProfile);
router.post("/update", protectRoute, updateUserProfile);
router.post("/upload-image", protectRoute, uploadProfileImage);
router.get("/search", protectRoute, searchUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.get("/suggested", protectRoute, getSuggestedUsers);

export default router;