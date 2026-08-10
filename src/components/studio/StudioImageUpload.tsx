import { Upload, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import Image from "next/image";

type StudioImageUploadProps = {
  characters?: { id: string; name: string; referenceUrls: string[] }[];
  characterId?: string;
  setCharacterId?: (id: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
};

export function StudioImageUpload({
  characters = [],
  characterId,
  setCharacterId,
  files,
  onFilesChange,
  maxSizeMB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || 10)
}: StudioImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCharacter = characters.find(c => c.id === characterId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(f => f.size <= maxSizeMB * 1024 * 1024);
      // Limit to 5 files
      const newFiles = [...files, ...validFiles].slice(0, 5);
      onFilesChange(newFiles);
    }
  };

  const handleRemove = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardBody className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-xs font-semibold uppercase tracking-wider m-0">Reference Images</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Use text prompt only, or add images to guide the style</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1 hidden sm:inline-block">Character:</span>
            <select
              value={characterId || ""}
              onChange={(e) => setCharacterId?.(e.target.value)}
              className="flex h-7 w-[140px] rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus:outline-none truncate"
            >
              <option value="">None</option>
              {characters.map(char => (
                <option key={char.id} value={char.id}>
                  Load: {char.name}
                </option>
              ))}
            </select>
            <Badge className="badge-outline text-muted-foreground font-normal">Optional</Badge>
          </div>
        </div>
        <input
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {selectedCharacter ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {selectedCharacter.referenceUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Character Image ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {selectedCharacter.referenceUrls.length === 0 && (
              <div className="col-span-full text-center text-xs text-muted-foreground py-4">
                This character has no reference images.
              </div>
            )}
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {files.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden group border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors"
              >
                <Upload className="size-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/30 hover:bg-muted/50 group mt-2 h-40"
          >
            <div className="size-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center leading-tight">
              <span className="block text-sm font-semibold group-hover:text-primary transition-colors">Click to upload</span>
              <span className="block text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to {maxSizeMB}MB</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
