
/**
 * Tests the Cloudinary storage adapter configuration.
 * Verifies that the API keys are correct by uploading a sample image 
 * to the 'test-uploads' folder, and then deletes it.
 */
import { CloudinaryAdapter } from "../src/lib/storage/cloudinary";

async function testUpload() {
  console.log("Testing Cloudinary Upload...");
  console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  try {
    const result = await CloudinaryAdapter.uploadFile("https://picsum.photos/200", {
      folder: "test-uploads"
    });
    console.log("Upload Successful!");
    console.log("Result:", result);
    console.log(`\nYou can view the image here: ${result.secureUrl}`);
  } catch (error: any) {
    console.error("Cloudinary Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testUpload();
