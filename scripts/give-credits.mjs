import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", UserSchema, "user");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await User.updateMany({}, { $inc: { credits: 100 } });
  console.log(`Updated ${res.modifiedCount} users with 100 credits.`);
  process.exit(0);
}

main().catch(console.error);
