// Run this using: node --env-file=.env scripts/test-pollinations-image.mjs
import fs from 'fs';

async function testPollinations() {
  // You created POLL_API_KEY, but remember Pollinations doesn't actually require it!
  // We will load it anyway just to follow the pattern.
  const apiKey = process.env.POLL_API_KEY;

  if (apiKey) {
    console.log("Found POLL_API_KEY in .env! (Though Pollinations works without it too)");
  } else {
    console.log("No POLL_API_KEY found, but that's perfectly fine for Pollinations!");
  }

  console.log("🚀 Testing Pollinations.ai (Free Image Generation)...");

  try {
    // We add a random seed and explicitly request the 'flux' model!
    const randomSeed = Math.floor(Math.random() * 1000000);
    const promptText = "A vibrant and colorful mobile game UI screen for a bakery-themed match-3 puzzle game. The game grid is filled with delicious 3D rendered match items: glossy donuts, frosted cupcakes, slices of cake, and chocolate chip cookies. The UI features a sweet, pastel bakery aesthetic with a score counter at the top, a vibrant 'Level 1' banner, and cute buttons. The background is a soft, blurred cozy bakery. High quality, mobile UI/UX design, cute casual gaming style, vibrant colors.";
    const prompt = encodeURIComponent(promptText);
    const url = `https://image.pollinations.ai/prompt/${prompt}?seed=${randomSeed}&width=1024&height=1024&nologo=true&model=flux`;

    const response = await fetch(url, {
      method: "GET",
      // We pass the key in the Authorization header just in case you have a special premium key
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
    });

    if (!response.ok) {
      console.error("❌ API Error:");
      console.error(response.status, response.statusText);
      return;
    }

    // Pollinations directly returns the image file buffer
    const buffer = await response.arrayBuffer();
    
    const outputPath = 'C:\\Users\\ITSolutions\\.gemini\\antigravity-ide\\brain\\2ecf4153-cfab-4ca3-a2da-08a025eebc1b\\scratch\\test-flux-image.jpg';
    
    // Create the scratch directory if it doesn't exist
    const dir = 'C:\\Users\\ITSolutions\\.gemini\\antigravity-ide\\brain\\2ecf4153-cfab-4ca3-a2da-08a025eebc1b\\scratch';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    console.log("✅ Success! Pollinations generated a Flux image.");
    console.log(`🖼️ Saved the generated image to ${outputPath}`);
    console.log("This API works perfectly, has NO credit limits, and won't get blocked!");

  } catch (error) {
    console.error("❌ Fetch Error:", error);
  }
}

testPollinations();
