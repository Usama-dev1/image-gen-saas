import mongoose from "mongoose";

const MONGODB_URI = "mongodb://rajausamah:16041993@ac-sm53qpl-shard-00-00.dy0xnic.mongodb.net:27017,ac-sm53qpl-shard-00-01.dy0xnic.mongodb.net:27017,ac-sm53qpl-shard-00-02.dy0xnic.mongodb.net:27017/Imgsaas?ssl=true&replicaSet=atlas-c1cr07-shard-0&authSource=admin&appName=Blogapp";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Failed to get db connection");
    }
    
    // Update all users to have maxCharacters = 50
    const result = await db.collection("user").updateMany(
      {}, 
      { $set: { "limits.maxCharacters": 50 } }
    );

    console.log(`Updated ${result.modifiedCount} users to have 50 character slots.`);
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
