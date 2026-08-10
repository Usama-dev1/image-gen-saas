// Run this using: node --env-file=.env scripts/test-gemini-image.mjs

async function testGeminiImageGen() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1);
  }

  console.log("🚀 Testing Gemini 3.1 Flash Image generation...");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Generate an image of a cute dog in a park' }]
          }]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:");
      console.error(JSON.stringify(data, null, 2));
      return;
    }

    if (data.candidates && data.candidates.length > 0) {
      console.log("✅ Success! Model responded.");
      
      const part = data.candidates[0].content.parts[0];
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        const base64Data = part.inlineData.data;
        console.log(`Image data length: ${base64Data.length} characters (Base64)`);
        
        const fs = require('fs');
        fs.writeFileSync('test-image.jpg', Buffer.from(base64Data, 'base64'));
        console.log("🖼️ Saved the generated image to 'test-image.jpg' in your project folder!");
      } else {
        console.log("Output was not an image, it returned:");
        console.log(JSON.stringify(part, null, 2));
      }
      
      console.log("The API key is working perfectly for the 'gemini-3.1-flash-image' model!");
    } else {
      console.error("❌ Unexpected response format:");
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error);
  }
}

testGeminiImageGen();
