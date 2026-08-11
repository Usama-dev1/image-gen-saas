"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GenerationCard, GenerationItem } from "./GenerationCard";
import { GenerationModal } from "./GenerationModal";
import { Button } from "@/components/ui/button";

import { deleteGenerationAction } from "@/actions/delete-generation";
import { getGenerationsAction } from "@/actions/generations";

export type GenerationsViewProps = {
  generations: GenerationItem[];
  nextCursor?: string;
};

export function GenerationsView({ generations: initialGenerations, nextCursor: initialCursor }: GenerationsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<GenerationItem[]>(initialGenerations);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GenerationItem | null>(null);
  const [deleteModalGenId, setDeleteModalGenId] = useState<string | null>(null);

  // Sync props when URL filters change
  useEffect(() => {
    setItems(initialGenerations);
    setCursor(initialCursor);
  }, [initialGenerations, initialCursor]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("cursor"); // Reset cursor when filters change
      return params.toString();
    },
    [searchParams]
  );

  function handleDeleteClick(id: string) {
    setDeleteModalGenId(id);
  }

  async function confirmDelete() {
    if (!deleteModalGenId) return;
    
    const idToDelete = deleteModalGenId;
    setItems((prev) => prev.filter((item) => item.id !== idToDelete));
    setDeleteModalGenId(null);
    
    const res = await deleteGenerationAction(idToDelete);
    if (res.error) {
      console.error("Failed to delete", res.error);
      // Optionally revert here
    }
  }

  async function loadMore() {
    if (!cursor || isLoading) return;
    setIsLoading(true);

    try {
      const filters = {
        status: searchParams.get("status") || undefined,
        model: searchParams.get("model") || undefined,
        source: searchParams.get("source") || undefined,
      };

      // We use limit 3 to match testing, or limit 20 for prod
      const res = await getGenerationsAction(cursor, 3, filters);
      if (res.error || !res.data) throw new Error(res.error || "Failed to fetch more");
      const data = res.data;

      const newItems: GenerationItem[] = data.map((g: any) => {
        const dateObj = new Date(g.createdAt);
        return {
          id: g._id,
          outputUrl: g.outputUrl,
          prompt: g.prompt,
          modelSlug: g.modelSlug,
          status: g.status,
          createdAt: dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString(),
          cost: g.cost,
        };
      });

      setItems((prev) => [...prev, ...newItems]);

      const hasMore = data.length === 3;
      setCursor(hasMore ? data[data.length - 1]._id : undefined);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-1">Browse your entire history of generated images.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select 
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={searchParams.get("source") || ""}
            onChange={(e) => router.push(pathname + "?" + createQueryString("source", e.target.value))}
          >
            <option value="">All Sources</option>
            <option value="studio">Studio</option>
            <option value="batch">Batch</option>
            <option value="api">API</option>
          </select>

          <select 
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={searchParams.get("status") || ""}
            onChange={(e) => router.push(pathname + "?" + createQueryString("status", e.target.value))}
          >
            <option value="">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <select 
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={searchParams.get("model") || ""}
            onChange={(e) => router.push(pathname + "?" + createQueryString("model", e.target.value))}
          >
            <option value="">All Models</option>
            <option value="flux">Flux Schnell</option>
            <option value="flux-pro">Flux Pro</option>
            <option value="sdxl">SDXL</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((gen) => (
          <div key={gen.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted">
            <GenerationCard 
              gen={gen} 
              onClick={() => setSelectedImage(gen)} 
              onDelete={() => handleDeleteClick(gen.id)}
            />
          </div>
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center pt-8">
          <Button onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      <GenerationModal 
        gen={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {deleteModalGenId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setDeleteModalGenId(null)}
          />
          <div className="relative z-50 flex flex-col w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6">
            <h2 className="text-xl font-semibold mb-2">Delete Generation</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this generation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button className="btn-outline" onClick={() => setDeleteModalGenId(null)}>
                Cancel
              </Button>
              <Button className="btn-error" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
