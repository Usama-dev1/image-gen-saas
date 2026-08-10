import { Download, Info, Trash2, Cpu, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadImage } from "@/lib/download";

export type GenerationItem = {
  id: string;
  outputUrl?: string;
  prompt: string;
  modelSlug: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  createdAt: string;
  cost: number;
};

export function GenerationCard({ gen, onClick, onDelete }: { gen: GenerationItem; onClick: () => void; onDelete?: () => void }) {
  if (gen.status === "failed") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-destructive/10">
        <XCircle className="size-8 text-destructive mb-2 opacity-80" />
        <Badge className="bg-destructive text-destructive-foreground border-transparent uppercase text-[10px] mb-2">Failed</Badge>
        <p className="text-[10px] text-muted-foreground line-clamp-3">{gen.prompt}</p>
        <div className="absolute top-2 left-2">
          <Badge className="badge-outline text-[9px] uppercase text-muted-foreground border-muted-foreground/30">
            Refunded
          </Badge>
        </div>
      </div>
    );
  }

  if (gen.status === "pending" || gen.status === "processing") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/50 animate-pulse">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <Badge className="badge-outline text-[10px] uppercase text-muted-foreground">Processing</Badge>
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={gen.outputUrl} 
        alt={gen.prompt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Hover Overlay */}
      <div 
        onClick={onClick}
        className="cursor-pointer absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3"
      >
        <div className="flex justify-between items-start">
          <Badge className="badge-neutral text-[9px] uppercase px-1.5 py-0">
            <Cpu className="size-2.5 mr-1" />
            {gen.modelSlug}
          </Badge>
          <div className="flex gap-1">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (gen.outputUrl) downloadImage(gen.outputUrl, `character-${gen.id}.jpg`);
              }}
              className="inline-flex items-center justify-center btn-ghost btn-icon size-7 rounded-md bg-white/10 hover:bg-white/20 text-white backdrop-blur"
            >
              <Download className="size-3.5" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onDelete) onDelete();
              }}
              className="inline-flex items-center justify-center btn-ghost btn-icon size-7 rounded-md bg-white/10 hover:bg-destructive/80 text-white backdrop-blur"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-white line-clamp-3 mb-2 opacity-90 leading-tight">
            {gen.prompt}
          </p>
          <div className="flex items-center justify-between text-[10px] text-white/70">
            <span>{gen.createdAt}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="inline-flex items-center justify-center btn-ghost btn-icon size-5 text-white/70 hover:text-white hover:bg-transparent"
            >
              <Info className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
