import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SavePromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  promptName: string;
  setPromptName: (val: string) => void;
  promptText: string;
  onConfirmSave: () => void;
};

export function SavePromptModal({
  isOpen,
  onClose,
  promptName,
  setPromptName,
  promptText,
  onConfirmSave,
}: SavePromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
        <h3 className="text-xl font-semibold mb-2">Save Prompt</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Give your prompt a name so you can reuse it later from your templates.
        </p>
        <div className="mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
            Prompt Name
          </label>
          <Input 
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
            placeholder="e.g., Cyberpunk Streetwear"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button 
            type="button"
            className="btn-ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirmSave}
            disabled={!promptName.trim() || !promptText.trim()}
          >
            Save to Templates
          </Button>
        </div>
      </div>
    </div>
  );
}
