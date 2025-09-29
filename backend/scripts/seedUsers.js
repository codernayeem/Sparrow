import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

const sampleUsers = [
	{
		fullName: "John Smith",
		email: "john.smith@example.com",
		username: "johnsmith",
		password: "password123",
		bio: "Software developer passionate about web technologies and open source projects.",
		location: "New York, USA",
		website: "https://johnsmith.dev",
	},
	{
		fullName: "Sarah Johnson",
		email: "sarah.johnson@example.com",
		username: "sarahjohnson",
		password: "password123",
		bio: "UI/UX Designer creating beautiful digital experiences. Coffee lover ☕",
		location: "San Francisco, CA",
		website: "https://sarahdesigns.com",
	},
	{
		fullName: "Mike Chen",
		email: "mike.chen@example.com",
		username: "mikechen",
		password: "password123",
		bio: "Full-stack developer | React enthusiast | Building the future one line of code at a time",
		location: "Toronto, Canada",
	},
	{
		fullName: "Emily Davis",
		email: "emily.davis@example.com",
		username: "emilydavis",
		password: "password123",
		bio: "Product Manager at TechCorp. Love hiking and photography 📸",
		location: "Seattle, WA",
		website: "https://emilydavis.blog",
	},
	{
		fullName: "Alex Rodriguez",
		email: "alex.rodriguez@example.com",
		username: "alexrodriguez",
		password: "password123",
		bio: "DevOps Engineer | Cloud architecture | Kubernetes enthusiast",
		location: "Austin, TX",
	},
	{
		fullName: "Jessica Wang",
		email: "jessica.wang@example.com",
		username: "jessicawang",
		password: "password123",
		bio: "Data Scientist | Machine Learning | AI researcher | Python lover 🐍",
		location: "Boston, MA",
		website: "https://jessicawang.ai",
	},
	{
		fullName: "David Brown",
		email: "david.brown@example.com",
		username: "davidbrown",
		password: "password123",
		bio: "Mobile app developer | Flutter & React Native | Tech blogger",
		location: "London, UK",
		website: "https://davidbrown.tech",
	},
	{
		fullName: "Lisa Kim",
		email: "lisa.kim@example.com",
		username: "lisakim",
		password: "password123",
		bio: "Frontend developer | Vue.js specialist | Open source contributor",
		location: "Los Angeles, CA",
	},
	{
		fullName: "Ryan Wilson",
		email: "ryan.wilson@example.com",
		username: "ryanwilson",
		password: "password123",
		bio: "Backend engineer | Node.js | Database optimization expert",
		location: "Chicago, IL",
		website: "https://ryanwilson.dev",
	},
	{
		fullName: "Amanda Lee",
		email: "amanda.lee@example.com",
		username: "amandalee",
		password: "password123",
		bio: "Tech entrepreneur | Startup founder | Investor | Building the next big thing 🚀",
		location: "Silicon Valley, CA",
		website: "https://amandalee.ventures",
	},
	{
		fullName: "Carlos Martinez",
		email: "carlos.martinez@example.com",
		username: "carlosmartinez",
		password: "password123",
		bio: "Cybersecurity specialist | Ethical hacker | Privacy advocate",
		location: "Miami, FL",
	},
	{
		fullName: "Rachel Green",
		email: "rachel.green@example.com",
		username: "rachelgreen",
		password: "password123",
		bio: "Quality Assurance Engineer | Test automation | Agile methodologies",
		location: "Denver, CO",
		website: "https://rachelgreen.qa",
	},
	{
		fullName: "Tom Anderson",
		email: "tom.anderson@example.com",
		username: "tomanderson",
		password: "password123",
		bio: "Game developer | Unity expert | Indie game creator | Pixel art enthusiast",
		location: "Portland, OR",
	},
	{
		fullName: "Sophie Miller",
		email: "sophie.miller@example.com",
		username: "sophiemiller",
		password: "password123",
		bio: "Technical writer | Documentation specialist | API documentation expert",
		location: "Philadelphia, PA",
		website: "https://sophiemiller.docs",
	},
	{
		fullName: "Kevin Park",
		email: "kevin.park@example.com",
		username: "kevinpark",
		password: "password123",
		bio: "Machine Learning Engineer | TensorFlow | PyTorch | AI research",
		location: "San Diego, CA",
	}
];

const seedUsers = async () => {
	try {
		await connectDB();

		// Clear existing users (optional - remove if you want to keep existing users)
		console.log("Clearing existing test users...");
		await User.deleteMany({ 
			email: { $in: sampleUsers.map(user => user.email) } 
		});

		console.log("Creating test users...");
		
		const hashedUsers = await Promise.all(
			sampleUsers.map(async (user) => {
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(user.password, salt);
				return {
					...user,
					password: hashedPassword,
				};
			})
		);

		const createdUsers = await User.insertMany(hashedUsers);
		console.log(`Successfully created ${createdUsers.length} test users`);

		// Create some random follow relationships
		console.log("Creating follow relationships...");
		const userIds = createdUsers.map(user => user._id);
		
		for (let i = 0; i < userIds.length; i++) {
			// Each user follows 2-5 random other users
			const followCount = Math.floor(Math.random() * 4) + 2;
			const otherUsers = userIds.filter((id, index) => index !== i);
			
			for (let j = 0; j < followCount && j < otherUsers.length; j++) {
				const randomIndex = Math.floor(Math.random() * otherUsers.length);
				const userToFollow = otherUsers.splice(randomIndex, 1)[0];
				
				// Add to following for current user
				await User.findByIdAndUpdate(userIds[i], {
					$addToSet: { following: userToFollow }
				});
				
				// Add to followers for target user
				await User.findByIdAndUpdate(userToFollow, {
					$addToSet: { followers: userIds[i] }
				});
			}
		}

		console.log("Follow relationships created successfully!");
		console.log("\nTest users created with the following credentials:");
		console.log("Password for all users: password123");
		console.log("\nUsernames:");
		sampleUsers.forEach((user, index) => {
			console.log(`${index + 1}. ${user.username} (${user.fullName})`);
		});

		mongoose.connection.close();
		console.log("\nDatabase connection closed. Seeding completed!");
		
	} catch (error) {
		console.error("Error seeding users:", error);
		process.exit(1);
	}
};

seedUsers();