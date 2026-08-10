import { useState } from "react";
import { startGenerationAction } from "@/actions/generate";
import { deleteTempImagesAction } from "@/actions/upload";

export function useStudioGeneration(props: {
  promptText: string;
  negativePromptText: string;
  model: string;
  aspectRatio: string;
  quality: string;
  removeWatermark: boolean;
  characterId: string;
  uploadReferences: () => Promise<{ referenceImages: string[]; uploadedPublicIds: string[] }>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>();
  const [generationError, setGenerationError] = useState<string | undefined>();

  const handleGenerate = async () => {
    if (!props.promptText.trim()) return;
    
    let uploadedPublicIds: string[] = [];
    
    try {
      setIsGenerating(true);
      setGeneratedImageUrl(undefined);
      setGenerationError(undefined);

      const { referenceImages, uploadedPublicIds: ids } = await props.uploadReferences();
      uploadedPublicIds = ids;

      const res = await startGenerationAction({
        prompt: props.promptText, 
        modelSlug: props.model, 
        settings: { 
          negativePrompt: props.negativePromptText,
          aspectRatio: props.aspectRatio, 
          quality: props.quality, 
          removeWatermark: props.removeWatermark,
          referenceImages,
          characterId: props.characterId || undefined
        } 
      });

      if (res.error) {
        throw new Error(res.error);
      }

      const generationId = res.generationId;

      const MAX_POLL_ATTEMPTS = 60; // 2 minute timeout
      let pollCount = 0;

      const pollInterval = setInterval(async () => {
        pollCount++;

        if (pollCount >= MAX_POLL_ATTEMPTS) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationError("Generation timed out. Please try again.");
          if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
          return;
        }

        try {
          const statusRes = await fetch(`/api/generate/${generationId}/status`);
          const statusData = await statusRes.json();

          if (statusData.status === "succeeded") {
            clearInterval(pollInterval);
            setGeneratedImageUrl(statusData.outputUrl);
            setIsGenerating(false);
            if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setGenerationError(`Generation failed: ${statusData.errorMessage || 'Unknown error'}`);
            if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationError("Lost connection while checking status.");
        }
      }, 2000); 
    } catch (error: any) {
      console.error(error);
      setGenerationError(error.message);
      setIsGenerating(false);
      if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
    }
  };

  return {
    isGenerating,
    generatedImageUrl,
    generationError,
    handleGenerate
  };
}
