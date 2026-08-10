"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Play, Cpu, CheckCircle2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { deletePromptAction, updatePromptAction } from "@/actions/prompts";
import { EditPromptModal } from "@/components/studio/EditPromptModal";

import { Pagination } from "@/components/ui/pagination";

export type PromptItem = {
  id: string;
  title: string;
  modelSlug: string;
  prompt: string;
  negativePrompt?: string;
  createdAt: string;
};

export type PromptsViewProps = {
  prompts: PromptItem[];
  currentPage?: number;
  totalPages?: number;
};

export function PromptsView({ prompts, currentPage = 1, totalPages = 1 }: PromptsViewProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUseInStudio = (item: PromptItem) => {
    const params = new URLSearchParams();
    params.set("prompt", item.prompt);
    if (item.negativePrompt) {
      params.set("negativePrompt", item.negativePrompt);
    }
    params.set("model", item.modelSlug);
    router.push(`/dashboard/studio?${params.toString()}`);
  };

  const handleCopy = async (item: PromptItem) => {
    await navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deletePromptAction(id);
      if (res && res.success) {
        router.refresh();
      } else if (res && res.error) {
        console.error("Failed to delete prompt", res.error);
      }
    } catch (error) {
      console.error("Failed to delete prompt", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = async (data: { title: string; prompt: string; negativePrompt?: string }) => {
    if (!editingPrompt) return;
    setIsSaving(true);
    try {
      const res = await updatePromptAction(editingPrompt.id, data);
      if (res && res.success) {
        setEditingPrompt(null);
        router.refresh();
      } else {
        console.error("Failed to update prompt", res?.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Saved Prompts</h1>
          <p className="text-muted-foreground mt-1">Quickly access and reuse your favorite text prompts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {prompts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No saved prompts yet. Head over to the Studio to save some!
          </div>
        )}
        {prompts.map((item) => (
          <Card key={item.id} className="group border-neutral-400/90 dark:border-neutral-500/90 shadow-lg hover:shadow-md transition-all duration-300">
            <CardBody className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <Badge className="badge-outline text-[10px] uppercase font-semibold gap-1">
                    <Cpu className="size-3" />
                    {item.modelSlug}
                  </Badge>
                </div>

                <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-sm font-medium text-foreground line-clamp-3">
                    {item.prompt}
                  </p>
                  {item.negativePrompt && (
                    <p className="text-xs text-destructive/80 line-clamp-1 border-t border-border/50 pt-2 mt-2">
                      <span className="font-semibold uppercase tracking-wider mr-1">Negative:</span>
                      {item.negativePrompt}
                    </p>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Saved on {item.createdAt}
                </div>
              </div>

              <div className="flex flex-col gap-2 justify-end shrink-0 md:border-l md:border-border md:pl-6">
                <Button className="btn-primary w-full gap-2" onClick={() => handleUseInStudio(item)}>
                  <Play className="size-4" />
                  Use in Studio
                </Button>
                <Button className="btn-outline w-full gap-2" onClick={() => setEditingPrompt(item)}>
                  <Edit2 className="size-4" />
                  Edit
                </Button>
                <Button className="btn-outline w-full gap-2" onClick={() => handleCopy(item)}>
                  {copiedId === item.id ? <CheckCircle2 className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  {copiedId === item.id ? "Copied!" : "Copy Text"}
                </Button>
                <Button
                  className="btn-ghost text-destructive hover:bg-destructive/10 hover:text-destructive w-full md:mt-auto gap-2"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  <Trash2 className="size-4" />
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/dashboard/prompts"
      />

      <EditPromptModal
        isOpen={!!editingPrompt}
        onClose={() => setEditingPrompt(null)}
        initialData={editingPrompt}
        onConfirmSave={handleEditSave}
        isSaving={isSaving}
      />
    </div>
  );
}
