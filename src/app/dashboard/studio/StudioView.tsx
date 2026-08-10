"use client";

import { StudioControls } from "@/components/studio/StudioControls";
import { StudioPreview } from "@/components/studio/StudioPreview";
import { SavePromptModal } from "@/components/studio/SavePromptModal";
import { SaveCharacterModal } from "@/components/studio/SaveCharacterModal";
import { TemplatesModal } from "@/components/studio/TemplatesModal";
import { useStudioForm } from "@/hooks/useStudioForm";

export type StudioViewProps = {
  templates: { id: string; title: string; prompt: string; isSystemTemplate: boolean }[];
  characters?: { id: string; name: string; referenceUrls: string[] }[];
};

export function StudioView({ templates, characters = [] }: StudioViewProps) {
  const {
    isGenerating,
    generatedImageUrl,
    generationError,
    promptName,
    setPromptName,
    referenceFiles,
    setReferenceFiles,
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
    isSaveModalOpen,
    setIsSaveModalOpen,
    isTemplatesModalOpen,
    setIsTemplatesModalOpen,
    isSaveCharModalOpen,
    setIsSaveCharModalOpen,
    charName,
    setCharName,
    charDesc,
    setCharDesc,
    characterId,
    setCharacterId,
    handleConfirmSave,
    handleConfirmSaveChar,
    handleGenerate
  } = useStudioForm();

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full relative">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tighter mb-1">AI Character Studio</h1>
        <p className="text-muted-foreground mt-1">Design consistent characters with precision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <StudioControls 
          characters={characters}
          characterId={characterId}
          setCharacterId={setCharacterId}
          files={referenceFiles}
          setFiles={setReferenceFiles}
          promptText={promptText}
          setPromptText={setPromptText}
          negativePromptText={negativePromptText}
          setNegativePromptText={setNegativePromptText}
          model={model}
          setModel={setModel}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          quality={quality}
          setQuality={setQuality}
          removeWatermark={removeWatermark}
          setRemoveWatermark={setRemoveWatermark}
          isGenerating={isGenerating}
          onSaveClick={() => setIsSaveModalOpen(true)}
          onTemplatesClick={() => setIsTemplatesModalOpen(true)}
          onGenerate={handleGenerate}
          onClear={() => setPromptText("")}
          generationError={generationError}
        />
        
        <StudioPreview 
          isGenerating={isGenerating}
          generatedImageUrl={generatedImageUrl}
          onSaveCharacterClick={() => setIsSaveCharModalOpen(true)}
        />
      </div>

      <SaveCharacterModal 
        isOpen={isSaveCharModalOpen}
        onClose={() => setIsSaveCharModalOpen(false)}
        charName={charName}
        setCharName={setCharName}
        charDesc={charDesc}
        setCharDesc={setCharDesc}
        onConfirmSave={handleConfirmSaveChar}
        imageUrl={generatedImageUrl}
      />

      <SavePromptModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        promptName={promptName}
        setPromptName={setPromptName}
        promptText={promptText}
        onConfirmSave={handleConfirmSave}
      />

      <TemplatesModal 
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        templates={templates}
        onSelectTemplate={(prompt) => {
          setPromptText(prompt);
          setIsTemplatesModalOpen(false);
        }}
      />
    </div>
  );
}
