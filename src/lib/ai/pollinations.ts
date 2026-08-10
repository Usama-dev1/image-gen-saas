import { AIProviderAdapter } from "../adapters/ai";

export const pollinationsAdapter: AIProviderAdapter = {
  async startGeneration(
    modelSlug: string,
    prompt: string,
    settings: any = {},
    apiKey?: string
  ) {
    const payload = JSON.stringify({ prompt, settings });
    const encodedPayload = Buffer.from(payload).toString("base64url");
    
    return {
      providerJobId: `pollinations-${encodedPayload}`,
    };
  },

  async checkStatus(providerJobId: string, apiKey?: string) {
    if (providerJobId.startsWith("pollinations-")) {
      try {
        const encodedPayload = providerJobId.replace("pollinations-", "");
        const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
        const { prompt, settings } = JSON.parse(payloadStr);

        const params = new URLSearchParams();
        if (settings?.removeWatermark !== false) {
          params.append("nologo", "true");
        }
        if (settings?.aspectRatio === "11") {
          params.append("width", "1024");
          params.append("height", "1024");
        } else if (settings?.aspectRatio === "169") {
          params.append("width", "1280");
          params.append("height", "720");
        } else {
          // default 3:4
          params.append("width", "768");
          params.append("height", "1024");
        }
        
        if (settings?.quality === "hd") {
          params.append("enhance", "true");
        }

        if (settings?.negativePrompt) {
          // Pollinations.ai accepts 'negative' as a parameter for negative prompts
          params.append("negative", settings.negativePrompt);
        }

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;

        return {
          status: "succeeded",
          outputUrl: imageUrl,
        };
      } catch (err) {
        return {
          status: "failed",
          errorMessage: "Failed to parse pollinations job data.",
        };
      }
    }

    // Fallback if an invalid ID is passed
    return {
      status: "failed",
      errorMessage: "Invalid or unrecognized providerJobId for Pollinations adapter.",
    };
  },
};
