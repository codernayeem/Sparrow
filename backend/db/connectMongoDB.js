import mongoose from "mongoose";

const connectMongoDB = async () => {
	try {
		const mongoUri = process.env.MONGO_URI;
		if (!mongoUri) {
			throw new Error("MONGO_URI environment variable is not set.");
		}
		const conn = await mongoose.connect(mongoUri);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error connection to mongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectMongoDB;
