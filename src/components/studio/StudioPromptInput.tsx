import { Bookmark, Wand2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type StudioPromptInputProps = {
  promptText: string;
  setPromptText: (val: string) => void;
  negativePromptText: string;
  setNegativePromptText: (val: string) => void;
  onSaveClick: () => void;
  onTemplatesClick: () => void;
};

export function StudioPromptInput({
  promptText,
  setPromptText,
  negativePromptText,
  setNegativePromptText,
  onSaveClick,
  onTemplatesClick,
}: StudioPromptInputProps) {
  return (
    <Card>
      <CardBody className="pb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider m-0">Prompt</div>
          <div className="flex gap-1">
            <Button 
              type="button" 
              className="btn-ghost btn-sm text-primary"
              onClick={onSaveClick}
            >
              <Bookmark className="size-3 mr-1" />
              Save
            </Button>
            <Button 
              type="button" 
              className="btn-ghost btn-sm text-primary"
              onClick={onTemplatesClick}
            >
              <Wand2 className="size-3 mr-1" />
              Templates
            </Button>
          </div>
        </div>
        <Textarea
          placeholder="Describe the character's pose, outfit, and environment in detail..."
          rows={4}
          className="mt-2"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <p className="text-[10px] text-muted-foreground text-right mt-2 mb-4">
          {promptText.length} / 1000
        </p>

        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wider">Negative Prompt (Optional)</div>
          <div className="flex gap-1">
            <Button 
              type="button" 
              className="btn-ghost btn-sm text-xs text-muted-foreground"
              onClick={() => {
                const masterNeg = "ugly, blurry, poor quality, bad anatomy, deformed, missing limbs, extra limbs, bad hands, mutated, low resolution, jpeg artifacts, watermark, signature, text, out of frame";
                const current = negativePromptText.trim();
                setNegativePromptText(current ? `${current}, ${masterNeg}` : masterNeg);
              }}
            >
              + Master Negative
            </Button>
            <Button 
              type="button" 
              className="btn-ghost btn-sm text-xs text-muted-foreground"
              onClick={() => setNegativePromptText("")}
            >
              Clear
            </Button>
          </div>
        </div>
        <Textarea
          placeholder="Things you want the AI to avoid (e.g. ugly, blurry, text)"
          rows={2}
          className="mt-1"
          value={negativePromptText}
          onChange={(e) => setNegativePromptText(e.target.value)}
        />
      </CardBody>
    </Card>
  );
}
