import { Download, Share2, Image as ImageIcon, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StudioPreviewProps = {
  isGenerating: boolean;
  generatedImageUrl?: string;
  onSaveCharacterClick?: () => void;
};

import { downloadImage } from "@/lib/download";

export function StudioPreview({ isGenerating, generatedImageUrl, onSaveCharacterClick }: StudioPreviewProps) {
  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    await downloadImage(generatedImageUrl, `character-${Date.now()}.jpg`);
  };

  const handleShare = async () => {
    if (!generatedImageUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My AI Character",
          url: generatedImageUrl,
        });
      } else {
        await navigator.clipboard.writeText(generatedImageUrl);
        alert("Image URL copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to share", err);
    }
  };

  return (
    <div className="md:col-span-7">
      <Card className="flex flex-col h-[500px] md:min-h-[700px] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider m-0">Preview Canvas</div>
          <div className="flex gap-2">
            <Button
              type="button"
              className="btn-outline h-8 gap-2 px-3 text-xs"
              disabled={!generatedImageUrl}
              onClick={onSaveCharacterClick}
            >
              <UserPlus className="size-3" />
              Save Character
            </Button>
            <Button
              type="button"
              className="btn-ghost btn-icon"
              disabled={!generatedImageUrl}
              onClick={handleDownload}
            >
              <Download className="size-4" />
            </Button>
            <Button
              type="button"
              className="btn-ghost btn-icon"
              disabled={!generatedImageUrl}
              onClick={handleShare}
            >
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative bg-base-100">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-sm font-medium animate-pulse">Loading your image...</p>
            </div>
          ) : generatedImageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedImageUrl}
                alt="Generated Character"
                className="max-w-full max-h-full object-contain rounded-md shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <ImageIcon className="size-10 text-muted-foreground" />
              <p>
                Your generated character will appear here. Adjust settings and
                prompt to refine.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
