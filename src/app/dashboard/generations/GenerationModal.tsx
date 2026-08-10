import { X, Download } from "lucide-react";
import { GenerationItem } from "./GenerationCard";
import { downloadImage } from "@/lib/download";

export function GenerationModal({ 
  gen, 
  isOpen, 
  onClose 
}: { 
  gen: GenerationItem | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen || !gen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 flex flex-col md:flex-row w-full max-h-[90vh] max-w-5xl bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Absolute Close Button */}
        <button 
          className="absolute top-3 right-3 md:top-4 md:right-4 z-50 inline-flex items-center justify-center size-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors" 
          onClick={onClose}
        >
          <X className="size-5" />
        </button>

        {/* Image Section */}
        <div className="relative bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden w-full h-[350px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={gen.outputUrl} 
            alt={gen.prompt}
            className="w-full h-full object-contain p-2 md:p-6"
          />
        </div>
        
        {/* Details Section */}
        <div className="w-full md:w-80 lg:w-96 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto shrink-0 border-t md:border-t-0 md:border-l border-border bg-card max-h-[50vh] md:max-h-full">
          <h3 className="font-semibold text-lg hidden md:block">Generation Details</h3>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-y-6">
            <div className="col-span-1 flex flex-col items-center text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Prompt</p>
              <p className="text-[10px] md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4">{gen.prompt}</p>
            </div>
            
            <div className="col-span-1 flex flex-col items-center text-center overflow-hidden">
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Model</p>
              <div className="badge badge-neutral font-mono text-[9px] md:text-xs px-1.5 py-0.5 rounded-md truncate max-w-full">{gen.modelSlug}</div>
            </div>
            
            <div className="col-span-1 flex flex-col items-center text-center overflow-hidden">
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Date</p>
              <p className="text-[9px] md:text-sm truncate">{gen.createdAt}</p>
            </div>

            <div className="col-span-1 flex flex-col items-center text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Cost</p>
              <p className="text-[10px] md:text-sm">{gen.cost} Credits</p>
            </div>
          </div>
          
          <div className="mt-auto pt-2 md:pt-6 flex gap-2">
            <button 
              onClick={() => gen.outputUrl && downloadImage(gen.outputUrl, `character-${gen.id}.jpg`)}
              className="btn btn-primary w-full flex-1 justify-center min-h-10"
            >
              <Download className="size-4 mr-2" /> Download
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
