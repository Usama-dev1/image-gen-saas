import mongoose from "mongoose";
import "../models/Session"; // Ensure TTL index is registered on boot
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = () => {
  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI || "";
    connectionPromise = mongoose.connect(uri).then((m) => {
      console.log("MongoDB Connected Successfully");
      return m;
    });
  }
  return connectionPromise;
};

export default connectDB;