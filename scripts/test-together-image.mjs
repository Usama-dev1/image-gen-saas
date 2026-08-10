// Run this using: node --env-file=.env scripts/test-together-image.mjs

async function testTogetherAI() {
  // Using the API key name you mentioned: TO_API_KEY
  const apiKey = process.env.TO_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: TO_API_KEY is not set in the .env file.");
    process.exit(1);
  }

  console.log("🚀 Testing Together AI API (FLUX.1-schnell)...");

  try {
    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: "A beautiful futuristic city at sunset, 4k",
        width: 1024,
        height: 1024,
        steps: 4,
        n: 1,
        response_format: "b64_json"
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:");
      console.error(JSON.stringify(data, null, 2));
      return;
    }

    if (data.data && data.data.length > 0) {
      const base64Data = data.data[0].b64_json;
      
      const fs = require('fs');
      fs.writeFileSync('test-together-image.jpg', Buffer.from(base64Data, 'base64'));
      
      console.log("✅ Success! Together AI generated an image.");
      console.log("🖼️ Saved the generated image to 'test-together-image.jpg' in your project folder!");
      console.log("Your Together AI API key is working perfectly and isn't blocked by your network!");
    } else {
      console.error("❌ Unexpected response format:");
      console.error(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ Fetch Error:", error);
  }
}

testTogetherAI();
