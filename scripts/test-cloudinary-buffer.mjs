import { v2 as cloudinary } from "cloudinary";
import { Buffer } from "node:buffer";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const url = "https://image.pollinations.ai/prompt/A%20futuristic%20city?nologo=true&width=1024&height=1024";
  
  try {
    console.log("Fetching image from Pollinations...");
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      throw new Error("Failed to fetch image");
    }
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Image fetched, size:", buffer.length);
    
    console.log("Uploading to Cloudinary...");
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "test" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    console.log("Success:", result.secure_url);
  } catch (err) {
    console.error("Error:", err);
  }
}

main().catch(console.error);
