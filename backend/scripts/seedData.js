import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (imagePath, folder) => {
	try {
		const fullPath = path.resolve(imagePath);
		if (!fs.existsSync(fullPath)) {
			console.log(`⚠️  Image not found: ${fullPath}`);
			return null;
		}
		
		const uploadResponse = await cloudinary.uploader.upload(fullPath, {
			folder: folder,
			resource_type: "image",
			transformation: [
				{ width: folder === "sparrow_profiles" ? 400 : 800, crop: "limit" },
				{ quality: "auto" }
			]
		});
		
		return uploadResponse.secure_url;
	} catch (error) {
		console.error(`Error uploading ${imagePath}:`, error.message);
		return null;
	}
};

// Upload all demo images to Cloudinary
const uploadDemoImages = async () => {
	console.log("📤 Uploading demo images to Cloudinary...");
	
	const profileImagePaths = [
		"demo_img/profile/1fd2f552fd263b8ba40a80f5c9097ee1.webp",
		"demo_img/profile/cut-up-33.webp",
		"demo_img/profile/image-2019-02-17_212949.webp",
		"demo_img/profile/person-indian-origin-having-fun_23-2150285283.webp",
		"demo_img/profile/photo-1522556189639-b150ed9c4330.webp",
		"demo_img/profile/premium_photo-1669703777437-27602d656c27.webp",
		"demo_img/profile/premium_photo-1688891564708-9b2247085923.webp",
		"demo_img/profile/summer-selfie.webp"
	];

	const postImagePaths = {
		tech: [
			"demo_img/post/big-tech-media.webp",
			"demo_img/post/seminar-coding-talking.webp",
			"demo_img/post/showing-smartphone-during-conference.webp",
			"demo_img/post/EM-BLOG-2019-tech-conferences-957689842.webp",
			"demo_img/post/business-colleagues-discussing-project-in-office.webp",
			"demo_img/post/close-up-of-co-workers-standing-at-desk-with-laptop-and-talking.webp",
			"demo_img/post/diverse-colleagues-working-together-on-digital-tablet.webp"
		],
		health: [
			"demo_img/post/good-health-best-wealth-card-stethoscope-red-heart-wood-table-medical-concept-72050180.webp",
			"demo_img/post/health-care-billing-statement.webp",
			"demo_img/post/health-png-diverse-hands-wellness-remix-transparent-background_53876-992471.webp",
			"demo_img/post/heart-doctor-concept.webp",
			"demo_img/post/hospital-colleagues-checking-medical-records-database.webp",
			"demo_img/post/illustration-healthy-lifestyle_53876-28533.webp",
			"demo_img/post/prescription-good-health-diet-exercise-flat-lay-overhead-prescription-good-health-overhead-stethoscope-healthy-145613048.webp",
			"demo_img/post/prescription-good-health-overhead-stethoscope-healthy-fresh-food-exercise-equipment-prescription-good-health-diet-145612862.webp",
			"demo_img/post/stethoscope-word-health_1134-455.webp"
		],
		education: [
			"demo_img/post/education-study-books-high-school-university-16383080.webp",
			"demo_img/post/special-education-phrase-chalkboard-next-to-three-books-apple-63191907.webp",
			"demo_img/post/business-people-at-a-conference-event.webp",
			"demo_img/post/dsc05880-enhanced-nr-copy.webp",
			"demo_img/post/pexels-photo-301920.webp"
		],
		general: [
			"demo_img/post/360_F_65947842_Q429oMgnuUoySIdWATs4XUXkGzfprRj7.webp",
			"demo_img/post/image.webp"
		]
	};

	// Upload profile images
	const uploadedProfileImages = [];
	for (const imagePath of profileImagePaths) {
		const cloudinaryUrl = await uploadImageToCloudinary(imagePath, "sparrow_profiles");
		if (cloudinaryUrl) {
			uploadedProfileImages.push(cloudinaryUrl);
		}
	}

	// Upload post images by category
	const uploadedPostImages = {
		tech: [],
		health: [],
		education: [],
		general: []
	};

	for (const [category, paths] of Object.entries(postImagePaths)) {
		for (const imagePath of paths) {
			const cloudinaryUrl = await uploadImageToCloudinary(imagePath, `sparrow_posts_${category}`);
			if (cloudinaryUrl) {
				uploadedPostImages[category].push(cloudinaryUrl);
			}
		}
	}

	console.log(`✅ Uploaded ${uploadedProfileImages.length} profile images`);
	console.log(`✅ Uploaded ${Object.values(uploadedPostImages).flat().length} post images`);

	return {
		profileImages: uploadedProfileImages,
		postImages: uploadedPostImages
	};
};

// Helper function to get random image
const getRandomImage = (imageArray) => {
	if (!imageArray || imageArray.length === 0) {
		return ""; // Return empty string if no images available
	}
	return imageArray[Math.floor(Math.random() * imageArray.length)];
};

const sampleUsers = [
	{
		fullName: "Dr. Sarah Mitchell",
		email: "sarah.mitchell@example.com",
		username: "drsarah",
		password: "password123",
		bio: "Healthcare professional & wellness advocate. Sharing insights on mental health and preventive medicine 🩺",
		location: "Boston, MA",
		website: "https://drsarah.health",
	},
	{
		fullName: "Alex Chen",
		email: "alex.chen@example.com",
		username: "alextech",
		password: "password123",
		bio: "Full-stack developer | React & Node.js | Building scalable web applications 💻",
		location: "San Francisco, CA",
		website: "https://alexchen.dev",
	},
	{
		fullName: "Prof. Emily Rodriguez",
		email: "emily.rodriguez@example.com",
		username: "profemily",
		password: "password123",
		bio: "Education researcher & online learning specialist. Passionate about making education accessible to all 📚",
		location: "New York, NY",
		website: "https://emilyrodriguez.edu",
	},
	{
		fullName: "Mike Johnson",
		email: "mike.johnson@example.com",
		username: "mikej",
		password: "password123",
		bio: "DevOps Engineer | Cloud Architecture | Kubernetes enthusiast | Coffee addict ☕",
		location: "Seattle, WA",
	},
	{
		fullName: "Dr. Lisa Park",
		email: "lisa.park@example.com",
		username: "drlisa",
		password: "password123",
		bio: "Nutritionist & fitness coach. Helping people achieve optimal health through balanced lifestyle 🥗💪",
		location: "Los Angeles, CA",
		website: "https://lisapark.fitness",
	},
	{
		fullName: "David Kumar",
		email: "david.kumar@example.com",
		username: "davidk",
		password: "password123",
		bio: "AI/ML Engineer | Python | TensorFlow | Building intelligent systems for tomorrow 🤖",
		location: "Austin, TX",
		website: "https://davidkumar.ai",
	},
	{
		fullName: "Jessica Thompson",
		email: "jessica.thompson@example.com",
		username: "jesst",
		password: "password123",
		bio: "Educational technology specialist | Making learning fun and interactive through gamification 🎮📖",
		location: "Chicago, IL",
	},
	{
		fullName: "Dr. Ryan Williams",
		email: "ryan.williams@example.com",
		username: "drryan",
		password: "password123",
		bio: "Emergency medicine physician | Health tech enthusiast | Advocating for better healthcare systems 🚑",
		location: "Houston, TX",
		website: "https://ryanwilliams.md",
	},
	{
		fullName: "Sophia Zhang",
		email: "sophia.zhang@example.com",
		username: "sophiaz",
		password: "password123",
		bio: "Frontend developer | React specialist | UI/UX enthusiast | Creating beautiful user experiences ✨",
		location: "Vancouver, Canada",
		website: "https://sophiazhang.design",
	},
	{
		fullName: "Dr. Maria Santos",
		email: "maria.santos@example.com",
		username: "drmaria",
		password: "password123",
		bio: "Pediatrician & child wellness advocate. Promoting healthy development from birth to adolescence 👶",
		location: "Miami, FL",
		website: "https://mariasantos.pediatrics",
	},
	{
		fullName: "James Wilson",
		email: "james.wilson@example.com",
		username: "jamesw",
		password: "password123",
		bio: "Cybersecurity engineer | Ethical hacker | Protecting digital infrastructure one vulnerability at a time 🔒",
		location: "Washington, DC",
		website: "https://jameswilson.security",
	}
];

const samplePosts = [
	{
		text: "🚀 The Future of Web Development: Why WebAssembly is Game-Changing\n\nAfter working with WebAssembly (WASM) for the past 6 months, I'm convinced it's going to revolutionize how we think about web performance. Here's what I've learned:\n\n✅ Near-native performance in the browser\n✅ Language agnostic - write in Rust, C++, or Go\n✅ Perfect for compute-intensive tasks\n✅ Seamless integration with JavaScript\n\nJust shipped a image processing tool that's 10x faster than the pure JS version. The difference is mind-blowing!\n\nWhat are your thoughts on WASM? Are you already using it in production?\n\n#WebDev #WebAssembly #Performance #TechTrends",
		authorUsername: "alextech",
		category: "tech"
	},
	{
		text: "🧠 Mental Health in the Digital Age: Finding Balance\n\nAs healthcare professionals, we're seeing an unprecedented rise in digital fatigue and anxiety disorders. Here are evidence-based strategies that actually work:\n\n📱 Digital Detox Rules:\n• No screens 1 hour before bed\n• Dedicated phone-free zones at home\n• Mindful social media consumption\n\n🧘 Daily Practices:\n• 10-minute morning meditation\n• Regular outdoor walks\n• Journaling for emotional regulation\n\n💪 Physical Wellness:\n• 150 minutes moderate exercise/week\n• Consistent sleep schedule (7-9 hours)\n• Proper hydration and nutrition\n\nRemember: Small, consistent changes lead to significant improvements. Your mental health is just as important as your physical health.\n\nWhat strategies have helped you maintain digital wellness?\n\n#MentalHealth #DigitalWellness #Healthcare #SelfCare",
		authorUsername: "drsarah",
		category: "health"
	},
	{
		text: "🎓 Revolutionizing Education Through Adaptive Learning Technologies\n\nAfter 3 years of research, our team has developed an AI-powered adaptive learning platform that personalizes education for each student. The results are remarkable:\n\n📊 Key Findings:\n• 40% improvement in learning retention\n• 60% reduction in time to mastery\n• 85% increase in student engagement\n• Works across all learning styles\n\n🔬 How it works:\n1. Real-time assessment of knowledge gaps\n2. Dynamic content adjustment based on performance\n3. Personalized learning paths for each student\n4. Continuous feedback and optimization\n\n🌟 Impact Stories:\n Students who previously struggled are now excelling. Teachers report more time for creative instruction rather than repetitive explanations.\n\nThe future of education is personalized, adaptive, and inclusive. We're just scratching the surface of what's possible when technology meets pedagogy.\n\nEducators: What challenges do you face that technology could help solve?\n\n#EdTech #Education #AI #PersonalizedLearning #Innovation",
		authorUsername: "profemily",
		category: "education"
	},
	{
		text: "☁️ Kubernetes in Production: Lessons from 2 Years of Container Orchestration\n\nJust hit our 2-year milestone running Kubernetes in production across 15+ microservices. Here are the hard-learned lessons:\n\n✅ What Worked:\n• GitOps with ArgoCD for deployment automation\n• Prometheus + Grafana for comprehensive monitoring\n• Istio service mesh for traffic management\n• Horizontal Pod Autoscaling for cost optimization\n\n❌ Common Pitfalls:\n• Over-engineering initially (start simple!)\n• Insufficient resource limits causing node failures\n• Not implementing proper RBAC from day one\n• Neglecting disaster recovery planning\n\n🔧 Pro Tips:\n1. Invest heavily in observability early\n2. Use namespaces for environment isolation\n3. Implement CI/CD pipelines with proper testing\n4. Regular cluster upgrades (don't skip versions!)\n5. Train your team - K8s has a steep learning curve\n\n💰 Cost Savings:\n40% reduction in infrastructure costs compared to traditional VMs, plus improved reliability and faster deployments.\n\nWhat's your K8s experience? What challenges are you facing?\n\n#Kubernetes #DevOps #CloudNative #Microservices #SRE",
		authorUsername: "mikej",
		category: "tech"
	},
	{
		text: "🥗 The Science of Sustainable Weight Management: Beyond Fad Diets\n\nAfter helping 500+ clients achieve lasting health transformations, here's what the research ACTUALLY shows about sustainable weight management:\n\n🚫 Myths Busted:\n• Quick fixes and extreme restrictions don't work long-term\n• Calories in vs calories out is oversimplified\n• One-size-fits-all approaches ignore individual biology\n\n✅ Evidence-Based Approach:\n\n🍽️ Nutrition:\n• Focus on whole, minimally processed foods\n• Adequate protein (0.8-1g per lb body weight)\n• Include healthy fats for hormone production\n• Fiber-rich carbohydrates for sustained energy\n\n🏃‍♀️ Movement:\n• Resistance training 2-3x/week (muscle preservation)\n• Cardio for cardiovascular health (not just fat loss)\n• Daily walks for mental health and digestion\n• Find activities you genuinely enjoy\n\n😴 Recovery:\n• 7-9 hours quality sleep (affects hunger hormones)\n• Stress management through meditation/hobbies\n• Regular health check-ups\n\n📈 The real secret? Consistency over perfection. Small, sustainable changes compound over time.\n\nWhat's ONE healthy habit you've successfully maintained? Share below!\n\n#NutritionScience #HealthCoaching #SustainableHealth #Wellness #Fitness",
		authorUsername: "drlisa",
		category: "health"
	},
	{
		text: "🎮 How Gamification is Transforming Learning Outcomes\n\nJust finished a 6-month study with 200+ students implementing gamification in online courses. The results are incredible!\n\n📈 Key Metrics:\n• 73% increase in course completion rates\n• 45% improvement in knowledge retention\n• 89% of students report higher engagement\n• 52% reduction in dropout rates\n\n🎯 What Actually Works:\n• Progress bars and achievement badges\n• Peer leaderboards (friendly competition)\n• Interactive challenges and quizzes\n• Storyline-based learning modules\n• Real-time feedback systems\n\n🧠 The Psychology:\nGamification taps into our intrinsic motivation through autonomy, mastery, and purpose. When students see their progress visually and feel ownership over their learning journey, magic happens.\n\n💡 Implementation Tips:\n1. Start small - add one gamified element at a time\n2. Make challenges achievable but not too easy\n3. Celebrate small wins to build momentum\n4. Focus on learning objectives, not just fun\n5. Gather continuous feedback from students\n\nEducators: Have you tried gamification in your teaching? What worked best for your students?\n\n#Gamification #EdTech #StudentEngagement #LearningInnovation #Education",
		authorUsername: "jesst",
		category: "education"
	},
	{
		text: "🤖 Building Production-Ready AI Models: Lessons from the Trenches\n\nAfter deploying 15+ ML models in production over the past 2 years, here are the hard truths about real-world AI implementation:\n\n🚫 Common Myths vs Reality:\n• Myth: \"More data always equals better models\"\n• Reality: Quality > Quantity. Clean, representative data wins\n\n• Myth: \"The latest algorithm will solve everything\"\n• Reality: Simple models often outperform complex ones in production\n\n✅ Production Essentials:\n\n🔧 Infrastructure:\n• Model versioning and rollback capabilities\n• A/B testing framework for model comparison\n• Real-time monitoring and alerting\n• Automated retraining pipelines\n• Feature stores for consistent data access\n\n📊 Monitoring:\n• Data drift detection\n• Model performance degradation alerts\n• Business metric tracking\n• Explainability and bias monitoring\n\n⚡ Performance:\n• Model compression techniques (quantization, pruning)\n• Caching strategies for frequently used predictions\n• Async prediction pipelines\n• Edge deployment for latency-critical applications\n\n🎯 The Real Challenge:\nIt's not building the model - it's maintaining it. 80% of ML work happens after deployment.\n\nML Engineers: What's your biggest production challenge? Let's share solutions!\n\n#MachineLearning #MLOps #AI #DataScience #ProductionML #TechLeadership",
		authorUsername: "davidk",
		category: "tech"
	},
	{
		text: "💊 The Future of Telemedicine: Transforming Healthcare Access\n\nAs an emergency physician who's witnessed the telemedicine revolution firsthand, here's what's really changing in healthcare:\n\n📱 Current Impact:\n• 85% of routine consultations now happen remotely\n• 40% reduction in emergency room visits for non-urgent cases\n• 60% improvement in follow-up compliance\n• Healthcare access expanded to rural communities\n\n🔬 Emerging Technologies:\n• AI-powered symptom checkers with 90%+ accuracy\n• Remote monitoring devices for chronic conditions\n• VR therapy for mental health treatment\n• Blockchain for secure patient data sharing\n\n🌟 Success Stories:\n• Diabetes management: Remote monitoring reduced hospitalizations by 50%\n• Mental health: Virtual therapy sessions increased accessibility by 300%\n• Chronic care: Continuous monitoring improved outcomes by 35%\n\n⚠️ Challenges We're Solving:\n• Ensuring data privacy and security\n• Managing technology barriers for elderly patients\n• Maintaining the human connection in digital care\n• Integrating with existing healthcare systems\n\n🔮 What's Next:\n• AI diagnosis assistance for complex cases\n• Personalized treatment plans based on genetic data\n• Predictive health analytics\n• Global healthcare collaboration platforms\n\nThe future of healthcare is personalized, accessible, and technology-enabled while preserving the essential human element of care.\n\nHealthcare professionals: How has telemedicine changed your practice?\n\n#Telemedicine #DigitalHealth #HealthcareTechnology #MedTech #PatientCare #Innovation",
		authorUsername: "drryan",
		category: "health"
	},
	{
		text: "🔒 Zero Trust Security: Why Traditional Perimeters Are Dead\n\nAfter 5 years implementing zero trust architectures for Fortune 500 companies, here's what every organization needs to know:\n\n💀 The Old Way (Perimeter Security):\n• \"Trust but verify\" mindset\n• VPN-based access control\n• Network segmentation as primary defense\n• Assumption: internal traffic is safe\n\n🛡️ Zero Trust Reality:\n• \"Never trust, always verify\"\n• Identity-based access control\n• Microsegmentation everywhere\n• Continuous monitoring and validation\n\n🎯 Key Implementation Steps:\n1. Inventory all assets and data flows\n2. Implement strong identity and access management\n3. Deploy micro-segmentation\n4. Enable continuous monitoring\n5. Automate threat response\n\n📊 Real Results:\n• 70% reduction in breach impact\n• 85% faster threat detection\n• 50% decrease in compliance violations\n• 40% improvement in user experience\n\n⚠️ Common Pitfalls:\n• Trying to implement everything at once\n• Neglecting user experience\n• Insufficient staff training\n• Poor integration with legacy systems\n\n🔮 The Future:\n• AI-powered behavioral analytics\n• Passwordless authentication\n• Cloud-native zero trust platforms\n• Automated policy enforcement\n\nCybersecurity professionals: What's your biggest challenge in implementing zero trust?\n\n#Cybersecurity #ZeroTrust #InfoSec #DigitalSecurity #TechLeadership",
		authorUsername: "jamesw",
		category: "tech"
	},
	{
		text: "👶 Early Childhood Development: The Critical First 1000 Days\n\nAs a pediatrician, I see daily how crucial the first 1000 days (conception to age 2) are for lifelong health. Here's what every parent should know:\n\n🧠 Brain Development Facts:\n• 80% of brain development occurs before age 3\n• 1 million neural connections form every SECOND in the first years\n• Early experiences literally shape brain architecture\n• Effects last a lifetime\n\n📊 Key Development Areas:\n\n🍼 Nutrition:\n• Breastfeeding for first 6 months (when possible)\n• Iron-rich foods prevent cognitive delays\n• Omega-3 fatty acids support brain growth\n• Avoid added sugars before age 2\n\n💬 Language:\n• Talk, read, and sing to your baby daily\n• Respond to baby's sounds and gestures\n• Narrate daily activities\n• Limit screen time before 18 months\n\n😴 Sleep:\n• Newborns: 14-17 hours per day\n• 6-12 months: 12-16 hours per day\n• Consistent bedtime routines\n• Safe sleep environment (back sleeping)\n\n❤️ Attachment:\n• Responsive caregiving builds secure attachment\n• Consistent, loving interactions\n• Managing parental stress is crucial\n• Early intervention if needed\n\n🚨 When to Seek Help:\n• Missed developmental milestones\n• Significant changes in behavior\n• Feeding or sleeping difficulties\n• Parental mental health concerns\n\nRemember: Every child develops at their own pace, but early support makes all the difference.\n\nParents: What questions do you have about your child's development?\n\n#Pediatrics #ChildDevelopment #EarlyChildhood #Parenting #HealthyKids",
		authorUsername: "drmaria",
		category: "health"
	}
];

const seedData = async () => {
	try {
		await connectDB();

		// Upload demo images to Cloudinary first
		const { profileImages, postImages } = await uploadDemoImages();

		console.log("🧹 Clearing existing data...");
		// Clear existing data for clean slate
		await User.deleteMany({ 
			email: { $in: sampleUsers.map(user => user.email) } 
		});
		await Post.deleteMany({});

		console.log("👥 Creating users...");
		
		// Hash passwords for all users and assign random profile images
		const hashedUsers = await Promise.all(
			sampleUsers.map(async (user) => {
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(user.password, salt);
				return {
					...user,
					password: hashedPassword,
					profileImg: getRandomImage(profileImages), // Assign random uploaded profile image
				};
			})
		);

		const createdUsers = await User.insertMany(hashedUsers);
		console.log(`✅ Successfully created ${createdUsers.length} users`);

		// Create user lookup map
		const userMap = {};
		createdUsers.forEach(user => {
			userMap[user.username] = user;
		});

		console.log("🤝 Creating follow relationships...");
		// Create realistic follow relationships
		const followRelationships = [
			// Tech people follow each other
			{ follower: "alextech", following: "mikej" },
			{ follower: "alextech", following: "davidk" },
			{ follower: "alextech", following: "sophiaz" },
			{ follower: "alextech", following: "jamesw" },
			{ follower: "mikej", following: "alextech" },
			{ follower: "mikej", following: "davidk" },
			{ follower: "mikej", following: "jamesw" },
			{ follower: "davidk", following: "alextech" },
			{ follower: "davidk", following: "sophiaz" },
			{ follower: "sophiaz", following: "alextech" },
			{ follower: "sophiaz", following: "mikej" },
			{ follower: "jamesw", following: "alextech" },
			{ follower: "jamesw", following: "mikej" },
			{ follower: "jamesw", following: "davidk" },
			
			// Health professionals follow each other
			{ follower: "drsarah", following: "drlisa" },
			{ follower: "drsarah", following: "drryan" },
			{ follower: "drsarah", following: "drmaria" },
			{ follower: "drlisa", following: "drsarah" },
			{ follower: "drlisa", following: "drryan" },
			{ follower: "drlisa", following: "drmaria" },
			{ follower: "drryan", following: "drsarah" },
			{ follower: "drryan", following: "drlisa" },
			{ follower: "drryan", following: "drmaria" },
			{ follower: "drmaria", following: "drsarah" },
			{ follower: "drmaria", following: "drlisa" },
			{ follower: "drmaria", following: "drryan" },
			
			// Education professionals
			{ follower: "profemily", following: "jesst" },
			{ follower: "jesst", following: "profemily" },
			
			// Cross-domain follows (realistic networking)
			{ follower: "profemily", following: "alextech" }, // educator interested in tech
			{ follower: "jesst", following: "davidk" }, // edtech interested in AI
			{ follower: "alextech", following: "drsarah" }, // tech person interested in health
			{ follower: "mikej", following: "drlisa" }, // DevOps person interested in fitness
			{ follower: "sophiaz", following: "profemily" }, // designer interested in education
			{ follower: "jamesw", following: "drryan" }, // cybersecurity interested in health tech
			{ follower: "drmaria", following: "jesst" }, // pediatrician interested in educational tools
		];

		for (const relationship of followRelationships) {
			const followerUser = userMap[relationship.follower];
			const followingUser = userMap[relationship.following];
			
			if (followerUser && followingUser) {
				await User.findByIdAndUpdate(followerUser._id, {
					$addToSet: { following: followingUser._id }
				});
				await User.findByIdAndUpdate(followingUser._id, {
					$addToSet: { followers: followerUser._id }
				});
			}
		}

		console.log("📝 Creating posts...");
		
		const createdPosts = [];
		for (const postData of samplePosts) {
			const author = userMap[postData.authorUsername];
			if (author) {
				// Get random image based on post category
				const categoryImages = postImages[postData.category] || postImages.general;
				const postImage = getRandomImage(categoryImages);
				
				const post = new Post({
					user: author._id,
					text: postData.text,
					img: postImage, // Use uploaded Cloudinary image
					visibility: "public",
					likes: [],
					comments: []
				});
				
				const savedPost = await post.save();
				createdPosts.push(savedPost);
			}
		}

		console.log("❤️ Adding likes to posts...");
		
		// Add realistic likes to posts
		for (let i = 0; i < createdPosts.length; i++) {
			const post = createdPosts[i];
			const postData = samplePosts[i];
			
			// Determine number of likes based on post category and quality
			let likeCount;
			if (postData.category === "tech") {
				likeCount = Math.floor(Math.random() * 25) + 35; // 35-60 likes for tech posts
			} else if (postData.category === "health") {
				likeCount = Math.floor(Math.random() * 30) + 40; // 40-70 likes for health posts
			} else if (postData.category === "education") {
				likeCount = Math.floor(Math.random() * 20) + 25; // 25-45 likes for education posts
			}
			
			// Select random users to like the post
			const allUsers = Object.values(userMap);
			const postAuthor = userMap[postData.authorUsername];
			const otherUsers = allUsers.filter(user => user._id.toString() !== postAuthor._id.toString());
			
			// Shuffle and select users to like the post
			const shuffledUsers = otherUsers.sort(() => 0.5 - Math.random());
			const likingUsers = shuffledUsers.slice(0, Math.min(likeCount, shuffledUsers.length));
			
			// Add likes to post
			const likerIds = likingUsers.map(user => user._id);
			await Post.findByIdAndUpdate(post._id, {
				$set: { likes: likerIds }
			});
			
			// Add liked posts to users' likedPosts array
			for (const user of likingUsers) {
				await User.findByIdAndUpdate(user._id, {
					$addToSet: { likedPosts: post._id }
				});
			}
			
			console.log(`  📈 Post "${postData.text.slice(0, 50)}..." got ${likerIds.length} likes`);
		}

		console.log("💬 Adding sample comments...");
		
		// Add some sample comments to make posts more realistic
		const sampleComments = [
			{ text: "Great insights! Thanks for sharing this.", username: "alextech" },
			{ text: "This is exactly what I needed to hear today. Thank you!", username: "drsarah" },
			{ text: "Excellent post! Have you considered the implications of...?", username: "profemily" },
			{ text: "Love this perspective. Definitely trying this approach.", username: "mikej" },
			{ text: "Really well written! Looking forward to more content like this.", username: "drlisa" },
			{ text: "This aligns perfectly with my recent research. Great work!", username: "davidk" },
			{ text: "Bookmarking this for future reference. Solid advice!", username: "jesst" },
			{ text: "Thanks for breaking this down so clearly!", username: "drryan" },
			{ text: "Inspiring! This motivated me to take action.", username: "sophiaz" }
		];

		for (let i = 0; i < createdPosts.length; i++) {
			const post = createdPosts[i];
			const postData = samplePosts[i];
			const postAuthor = userMap[postData.authorUsername];
			
			// Add 2-4 comments per post
			const commentCount = Math.floor(Math.random() * 3) + 2;
			const availableCommenters = Object.values(userMap).filter(user => 
				user._id.toString() !== postAuthor._id.toString()
			);
			
			for (let j = 0; j < commentCount && j < availableCommenters.length; j++) {
				const randomCommenter = availableCommenters[Math.floor(Math.random() * availableCommenters.length)];
				const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
				
				await Post.findByIdAndUpdate(post._id, {
					$push: {
						comments: {
							text: randomComment.text,
							user: randomCommenter._id
						}
					}
				});
			}
		}

		console.log("\n🎉 Seeding completed successfully!");
		console.log("\n📊 Summary:");
		console.log(`👥 Users created: ${createdUsers.length}`);
		console.log(`📝 Posts created: ${createdPosts.length}`);
		console.log(`🤝 Follow relationships: ${followRelationships.length}`);
		console.log("\n🔐 Login credentials:");
		console.log("Password for all users: password123");
		console.log("\n👤 User accounts:");
		sampleUsers.forEach((user, index) => {
			console.log(`${index + 1}. ${user.username} - ${user.fullName} (${user.bio.split('.')[0]})`);
		});

		mongoose.connection.close();
		console.log("\n✅ Database connection closed. Seeding completed!");
		
	} catch (error) {
		console.error("❌ Error seeding data:", error);
		process.exit(1);
	}
};

seedData();