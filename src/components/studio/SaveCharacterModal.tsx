import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SaveCharacterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  charName: string;
  setCharName: (name: string) => void;
  charDesc: string;
  setCharDesc: (desc: string) => void;
  onConfirmSave: () => void;
  imageUrl?: string;
};

export function SaveCharacterModal({
  isOpen,
  onClose,
  charName,
  setCharName,
  charDesc,
  setCharDesc,
  onConfirmSave,
  imageUrl,
}: SaveCharacterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm relative shadow-2xl">
        <Button 
          className="btn-ghost btn-icon absolute top-3 right-3 size-8 rounded-full bg-muted hover:bg-muted-foreground/10"
          onClick={onClose}
        >
          ✕
        </Button>
        <CardBody className="p-6">
          <CardTitle className="text-xl mb-4">Save as Character</CardTitle>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                value={charName}
                onChange={e => setCharName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Cyberpunk Hero" 
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea 
                value={charDesc}
                onChange={e => setCharDesc(e.target.value)}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Notes about this character..." 
              />
            </div>
            {imageUrl && (
              <div className="w-full aspect-square relative rounded-md overflow-hidden bg-muted border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageUrl} 
                  alt="Character Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button className="btn-outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={onConfirmSave} disabled={!charName.trim()}>
              Save Character
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
