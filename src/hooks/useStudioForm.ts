import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStudioUpload } from "./useStudioUpload";
import { useStudioSave } from "./useStudioSave";
import { useStudioGeneration } from "./useStudioGeneration";

export function useStudioForm() {
  const searchParams = useSearchParams();

  // Basic Form State
  const [promptText, setPromptText] = useState(searchParams.get("prompt") || "");
  const [negativePromptText, setNegativePromptText] = useState(searchParams.get("negativePrompt") || "");
  const [model, setModel] = useState(searchParams.get("model") || "pollinations");
  const [aspectRatio, setAspectRatio] = useState("34");
  const [quality, setQuality] = useState("hd");
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [characterId, setCharacterId] = useState("");

  // Sub-Hooks
  const uploadHook = useStudioUpload();
  const generationHook = useStudioGeneration({
    promptText, negativePromptText, model, aspectRatio, quality, 
    removeWatermark, characterId, uploadReferences: uploadHook.uploadReferences
  });
  const saveHook = useStudioSave({
    promptText, negativePromptText, model, generatedImageUrl: generationHook.generatedImageUrl
  });

  return {
    ...uploadHook,
    ...generationHook,
    ...saveHook,
    promptText, setPromptText,
    negativePromptText, setNegativePromptText,
    model, setModel,
    aspectRatio, setAspectRatio,
    quality, setQuality,
    removeWatermark, setRemoveWatermark,
    characterId, setCharacterId
  };
}
