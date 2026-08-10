import { StudioImageUpload } from "./StudioImageUpload";
import { StudioPromptInput } from "./StudioPromptInput";
import { StudioGenerationSettings } from "./StudioGenerationSettings";

type StudioControlsProps = {
  characters?: { id: string; name: string; referenceUrls: string[] }[];
  characterId: string;
  setCharacterId: (id: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  promptText: string;
  setPromptText: (val: string) => void;
  negativePromptText: string;
  setNegativePromptText: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
  aspectRatio: string;
  setAspectRatio: (val: string) => void;
  quality: string;
  setQuality: (val: string) => void;
  removeWatermark: boolean;
  setRemoveWatermark: (val: boolean) => void;
  isGenerating: boolean;
  onSaveClick: () => void;
  onTemplatesClick: () => void;
  onGenerate: () => void;
  onClear: () => void;
  generationError?: string;
};

export function StudioControls({
  characters = [],
  characterId,
  setCharacterId,
  files,
  setFiles,
  promptText,
  setPromptText,
  negativePromptText,
  setNegativePromptText,
  model,
  setModel,
  aspectRatio,
  setAspectRatio,
  quality,
  setQuality,
  removeWatermark,
  setRemoveWatermark,
  isGenerating,
  onSaveClick,
  onTemplatesClick,
  onGenerate,
  onClear,
  generationError,
}: StudioControlsProps) {
  return (
    <div className="md:col-span-5 flex flex-col gap-5 relative">

      <StudioImageUpload
        characters={characters}
        characterId={characterId}
        setCharacterId={setCharacterId}
        files={files}
        onFilesChange={setFiles}
      />

      <StudioPromptInput
        promptText={promptText}
        setPromptText={setPromptText}
        negativePromptText={negativePromptText}
        setNegativePromptText={setNegativePromptText}
        onSaveClick={onSaveClick}
        onTemplatesClick={onTemplatesClick}
      />

      <StudioGenerationSettings
        model={model}
        setModel={setModel}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        quality={quality}
        setQuality={setQuality}
        removeWatermark={removeWatermark}
        setRemoveWatermark={setRemoveWatermark}
        isGenerating={isGenerating}
        onGenerate={onGenerate}
        onClear={onClear}
        generationError={generationError}
        isGenerateDisabled={isGenerating || !promptText.trim()}
      />
    </div>
  );
}
