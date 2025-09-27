import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username }).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const { fullName, username, email, bio, location, website } = req.body;
		const userId = req.user._id;

		let user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Check if new email is already taken by another user
		if (email && email !== user.email) {
			const existingUser = await User.findOne({ email });
			if (existingUser && existingUser._id.toString() !== userId.toString()) {
				return res.status(400).json({ error: "Email is already taken" });
			}
		}

		// Check if new username is already taken by another user
		if (username && username !== user.username) {
			const existingUser = await User.findOne({ username: username.toLowerCase() });
			if (existingUser && existingUser._id.toString() !== userId.toString()) {
				return res.status(400).json({ error: "Username is already taken" });
			}
		}

		// Update fields
		if (fullName) user.fullName = fullName;
		if (username) user.username = username.toLowerCase();
		if (email) user.email = email;
		if (bio !== undefined) user.bio = bio; // Allow empty string
		if (location !== undefined) user.location = location;
		if (website !== undefined) user.website = website;

		// Validate field lengths
		if (user.bio && user.bio.length > 160) {
			return res.status(400).json({ error: "Bio must be 160 characters or less" });
		}
		if (user.location && user.location.length > 50) {
			return res.status(400).json({ error: "Location must be 50 characters or less" });
		}
		if (user.website && user.website.length > 100) {
			return res.status(400).json({ error: "Website must be 100 characters or less" });
		}

		user = await user.save();

		// Return user without password
		const { password, ...userWithoutPassword } = user.toObject();
		res.status(200).json(userWithoutPassword);
	} catch (error) {
		console.log("Error in updateUserProfile controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const uploadProfileImage = async (req, res) => {
	try {
		const { profileImg } = req.body;
		const userId = req.user._id;

		if (!profileImg) {
			return res.status(400).json({ error: "Profile image is required" });
		}

		let user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Delete old image from cloudinary if exists
		if (user.profileImg) {
			const publicId = user.profileImg.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(publicId);
		}

		// Upload new image to cloudinary
		const uploadedResponse = await cloudinary.uploader.upload(profileImg, {
			folder: "sparrow_profiles",
		});

		user.profileImg = uploadedResponse.secure_url;
		await user.save();

		// Return user without password
		const { password, ...userWithoutPassword } = user.toObject();
		res.status(200).json(userWithoutPassword);
	} catch (error) {
		console.log("Error in uploadProfileImage controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const searchUsers = async (req, res) => {
	try {
		const { q } = req.query;
		const currentUserId = req.user._id;

		if (!q) {
			return res.status(400).json({ error: "Search query is required" });
		}

		const users = await User.find({
			$and: [
				{ _id: { $ne: currentUserId } }, // Exclude current user
				{
					$or: [
						{ fullName: { $regex: q, $options: "i" } },
						{ username: { $regex: q, $options: "i" } },
						{ email: { $regex: q, $options: "i" } }
					]
				}
			]
		}).select("-password").limit(10);

		res.status(200).json(users);
	} catch (error) {
		console.log("Error in searchUsers controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const currentUserId = req.user._id;

		if (id === currentUserId.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		const userToModify = await User.findById(id);
		const currentUser = await User.findById(currentUserId);

		if (!userToModify || !currentUser) {
			return res.status(404).json({ error: "User not found" });
		}

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow user
			await User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
			await User.findByIdAndUpdate(currentUserId, { $pull: { following: id } });
			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow user
			await User.findByIdAndUpdate(id, { $push: { followers: currentUserId } });
			await User.findByIdAndUpdate(currentUserId, { $push: { following: id } });
			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const checkUsernameAvailability = async (req, res) => {
	try {
		const { username } = req.body;

		if (!username) {
			return res.status(400).json({ error: "Username is required" });
		}

		// Validate username format
		const usernameRegex = /^[a-zA-Z0-9_]+$/;
		if (!usernameRegex.test(username)) {
			return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
		}

		if (username.length < 3 || username.length > 20) {
			return res.status(400).json({ error: "Username must be between 3 and 20 characters" });
		}

		const existingUser = await User.findOne({ username: username.toLowerCase() });
		const isAvailable = !existingUser;

		res.status(200).json({ available: isAvailable });
	} catch (error) {
		console.log("Error in checkUsernameAvailability controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const generateUsernamesSuggestion = async (req, res) => {
	try {
		const { fullName } = req.body;

		if (!fullName) {
			return res.status(400).json({ error: "Full name is required" });
		}

		// Generate base username from full name
		const baseUsername = fullName
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]/g, "")
			.substring(0, 15);

		const suggestions = [];

		// First suggestion: clean name
		suggestions.push(baseUsername);

		// Add variations with numbers
		for (let i = 1; i <= 5; i++) {
			const randomNum = Math.floor(Math.random() * 1000);
			suggestions.push(`${baseUsername}${randomNum}`);
			suggestions.push(`${baseUsername}_${randomNum}`);
		}

		// Check availability for each suggestion
		const availableSuggestions = [];
		for (const suggestion of suggestions) {
			if (suggestion.length >= 3 && suggestion.length <= 20) {
				const existingUser = await User.findOne({ username: suggestion });
				if (!existingUser) {
					availableSuggestions.push(suggestion);
					if (availableSuggestions.length >= 3) break;
				}
			}
		}

		res.status(200).json({ suggestions: availableSuggestions });
	} catch (error) {
		console.log("Error in generateUsernamesSuggestion controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};