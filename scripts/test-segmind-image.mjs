// Run this using: node --env-file=.env scripts/test-segmind-image.mjs

async function testSegmind() {
  const apiKey = process.env.SEGMIND_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: SEGMIND_API_KEY is not set in the .env file.");
    process.exit(1);
  }

  console.log("🚀 Testing Segmind API (FLUX.1-schnell) with free daily credits...");

  try {
    const response = await fetch("https://api.segmind.com/v1/flux-schnell", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "A beautiful futuristic city at sunset, 4k",
        steps: 4,
        seed: Math.floor(Math.random() * 1000000),
        width: 1024,
        height: 1024,
        base64: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ API Error:");
      console.error(errorData);
      return;
    }

    const data = await response.json();

    if (data.image) {
      const fs = require('fs');
      // Segmind returns the base64 string directly in the `image` field
      fs.writeFileSync('test-segmind-image.jpg', Buffer.from(data.image, 'base64'));
      
      console.log("✅ Success! Segmind generated an image.");
      console.log("🖼️ Saved the generated image to 'test-segmind-image.jpg' in your project folder!");
      console.log("Your Segmind API key is working perfectly with your free daily credits!");
    } else {
      console.error("❌ Unexpected response format:");
      console.error(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ Fetch Error:", error);
  }
}

testSegmind();
