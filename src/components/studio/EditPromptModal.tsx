import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

type EditPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: { id: string; title: string; prompt: string; negativePrompt?: string } | null;
  onConfirmSave: (data: { title: string; prompt: string; negativePrompt?: string }) => void;
  isSaving: boolean;
};

export function EditPromptModal({
  isOpen,
  onClose,
  initialData,
  onConfirmSave,
  isSaving,
}: EditPromptModalProps) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || "");
      setPrompt(initialData.prompt || "");
      setNegativePrompt(initialData.negativePrompt || "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10dvh] bg-background/80 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 w-full max-w-lg shadow-2xl relative max-h-[80dvh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          disabled={isSaving}
        >
          <X className="size-5" />
        </button>
        <h3 className="text-xl font-semibold mb-2 hidden md:block">Edit Prompt</h3>
        <p className="text-sm text-muted-foreground mb-6 hidden md:block">
          Update your saved prompt details below.
        </p>

        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 mt-4 md:mt-0">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
              Prompt Name
            </label>
            <textarea
              value={title}
              className="flex min-h-[60px] md:min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cyberpunk Streetwear"
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
              Main Prompt
            </label>
            <textarea
              className="flex min-h-[60px] md:min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A highly detailed portrait of..."
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-muted-foreground">
              Negative Prompt (Optional)
            </label>
            <textarea
              className="flex min-h-[40px] md:min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blur, ugly, low quality..."
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirmSave({ title, prompt, negativePrompt: negativePrompt || undefined })}
            disabled={!title.trim() || !prompt.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
