import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const url = "https://image.pollinations.ai/prompt/A%20futuristic%20city?nologo=true&width=1024&height=1024";
  
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: "test",
      resource_type: "image",
    });
    console.log("Success:", result.secure_url);
  } catch (err) {
    console.error("Cloudinary error:", err);
  }
}

main().catch(console.error);
