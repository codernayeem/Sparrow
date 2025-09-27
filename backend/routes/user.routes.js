import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfileImage,
  searchUsers,
  followUnfollowUser,
  getSuggestedUsers,
  checkUsernameAvailability,
  generateUsernamesSuggestion
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/update", protectRoute, updateUserProfile);
router.post("/upload-image", protectRoute, uploadProfileImage);
router.get("/search", protectRoute, searchUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/check-username", checkUsernameAvailability);
router.post("/suggest-username", generateUsernamesSuggestion);

export default router;