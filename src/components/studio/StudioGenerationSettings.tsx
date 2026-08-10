import { ChevronDown, Fingerprint, Brush } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type StudioGenerationSettingsProps = {
  model: string;
  setModel: (val: string) => void;
  aspectRatio: string;
  setAspectRatio: (val: string) => void;
  quality: string;
  setQuality: (val: string) => void;
  removeWatermark: boolean;
  setRemoveWatermark: (val: boolean) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onClear: () => void;
  generationError?: string;
  isGenerateDisabled: boolean;
};

export function StudioGenerationSettings({
  model,
  setModel,
  aspectRatio,
  setAspectRatio,
  quality,
  setQuality,
  removeWatermark,
  setRemoveWatermark,
  isGenerating,
  onGenerate,
  onClear,
  generationError,
  isGenerateDisabled,
}: StudioGenerationSettingsProps) {
  return (
    <>
      <Card>
        <CardBody className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
              AI Model
            </label>
            <div className="relative">
              <Select 
                className="w-full appearance-none pr-8 cursor-pointer" 
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="pollinations">Pollinations (Fast & Free)</option>
                <option value="kling" disabled>Kling IMAGE 3.0 (Soon)</option>
                <option value="seedream" disabled>Seedream 5.0 Pro (Soon)</option>
              </Select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
                Aspect Ratio
              </label>
              <div className="relative">
                <Select 
                  className="w-full appearance-none pr-8 cursor-pointer" 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                >
                  <option value="11">1:1 Square</option>
                  <option value="34">3:4 Portrait</option>
                  <option value="169">16:9 Landscape</option>
                </Select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block">
                Quality
              </label>
              <div className="relative">
                <Select 
                  className="w-full appearance-none pr-8 cursor-pointer" 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                </Select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="divider m-0 opacity-50"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Fingerprint className="size-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Remove Watermark
                </span>
                <span className="text-xs text-muted-foreground">
                  Clean output images
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={removeWatermark} 
                onChange={(e) => setRemoveWatermark(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-base-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Error Message */}
      {generationError && (
        <div className="bg-red-500/10 text-red-500 text-sm font-medium p-3 rounded-lg flex items-center gap-2 border border-red-500/20">
          <span className="shrink-0 size-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">!</span>
          {generationError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" className="btn-outline flex-1 max-w-[120px]" onClick={onClear} disabled={isGenerating}>
          Clear
        </Button>
        <Button 
          type="button" 
          className="btn-primary flex-1" 
          onClick={onGenerate}
          disabled={isGenerateDisabled}
        >
          {isGenerating ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Generating...
            </>
          ) : (
            <>
              <Brush className="size-4" />
              Generate (1 Credit)
            </>
          )}
        </Button>
      </div>
    </>
  );
}
