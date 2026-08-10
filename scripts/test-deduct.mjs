import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  credits: Number,
}, { strict: false, collection: "user" });

const User = mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 1. Get first user
  const user = await User.findOne({});
  if (!user) {
    console.log("No users found");
    process.exit(1);
  }
  
  console.log("Found user:", user._id.toString(), "Credits:", user.credits);
  
  // 2. Try to deduct credits using string ID
  const stringId = user._id.toString();
  const amount = 1;
  
  const result = await User.findOneAndUpdate(
    { _id: stringId, credits: { $gte: amount } },
    { $inc: { credits: -amount } },
    { new: true }
  );
  
  if (result) {
    console.log("SUCCESS! Deducted credits. New balance:", result.credits);
  } else {
    console.log("FAILED to findOneAndUpdate");
  }
  
  process.exit(0);
}

main().catch(console.error);
