import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	fullName: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		minLength: 6,
	},
	profileImg: {
		type: String,
		default: "",
	},
	coverImg: {
		type: String,
		default: "",
	},
	bio: {
		type: String,
		default: "",
		maxLength: 160,
	},
	location: {
		type: String,
		default: "",
		maxLength: 50,
	},
	website: {
		type: String,
		default: "",
		maxLength: 100,
	},
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: [],
		},
	],
	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: [],
		},
	],
	likedPosts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			default: [],
		},
	],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;