import mongoose from "mongoose";
import "../models/Session"; // Ensure TTL index is registered on boot
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "";
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;