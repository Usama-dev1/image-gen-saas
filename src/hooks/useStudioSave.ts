import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePromptAction } from "@/actions/prompts";
import { saveGeneratedCharacterAction } from "@/actions/characters";

export function useStudioSave(props: {
  promptText: string;
  negativePromptText: string;
  model: string;
  generatedImageUrl?: string;
}) {
  const router = useRouter();

  const [promptName, setPromptName] = useState("");
  const [charName, setCharName] = useState("");
  const [charDesc, setCharDesc] = useState("");
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isSaveCharModalOpen, setIsSaveCharModalOpen] = useState(false);

  const handleConfirmSave = async () => {
    if (promptName.trim() && props.promptText.trim()) {
      try {
        const res = await savePromptAction({
          title: promptName, 
          prompt: props.promptText, 
          negativePrompt: props.negativePromptText,
          modelSlug: props.model,
          settings: {}
        });
        if (res && res.success) {
          router.refresh(); 
        } else if (res && res.error) {
          console.error("Failed to save prompt", res.error);
        }
      } catch (err) {
        console.error("Failed to save prompt", err);
      }
    }
    setIsSaveModalOpen(false);
    setPromptName("");
  };

  const handleConfirmSaveChar = async () => {
    if (charName.trim() && props.generatedImageUrl) {
      try {
        const res = await saveGeneratedCharacterAction({
          name: charName,
          description: charDesc,
          imageUrl: props.generatedImageUrl
        });
        if (res && res.success) {
          router.refresh(); 
        } else if (res && res.error) {
          console.error("Failed to save character", res.error);
        }
      } catch (err) {
        console.error("Failed to save character", err);
      }
    }
    setIsSaveCharModalOpen(false);
    setCharName("");
    setCharDesc("");
  };

  return {
    promptName, setPromptName,
    charName, setCharName,
    charDesc, setCharDesc,
    isSaveModalOpen, setIsSaveModalOpen,
    isTemplatesModalOpen, setIsTemplatesModalOpen,
    isSaveCharModalOpen, setIsSaveCharModalOpen,
    handleConfirmSave,
    handleConfirmSaveChar
  };
}
