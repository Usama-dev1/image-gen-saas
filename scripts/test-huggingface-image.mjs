// Run this using: node --env-file=.env scripts/test-huggingface-image.mjs

async function testHuggingFace() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: HUGGINGFACE_API_KEY is not set in the .env file.");
    process.exit(1);
  }

  console.log("🚀 Testing Hugging Face Inference API (FLUX.1-schnell)...");

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: "A cute dog wearing a tiny hat" }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ API Error:");
      console.error(errorData);
      return;
    }

    // Hugging Face returns the raw image buffer
    const buffer = await response.arrayBuffer();
    const fs = require('fs');
    fs.writeFileSync('test-hf-image.jpg', Buffer.from(buffer));
    
    console.log("✅ Success! Hugging Face generated an image.");
    console.log("🖼️ Saved the generated image to 'test-hf-image.jpg' in your project folder!");
    console.log("Your Hugging Face API key is working perfectly!");

  } catch (error) {
    console.error("❌ Fetch Error:", error);
  }
}

testHuggingFace();
