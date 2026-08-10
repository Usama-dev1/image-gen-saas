// 'use client' is required here because we use useState for the local UI state of the character view modal.
"use client";

import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Trash2, Image as ImageIcon, Lock, User as UserIcon, ExternalLink } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useState } from "react";
import { StudioImageUpload } from "@/components/studio/StudioImageUpload";
import { createCharacterAction, deleteCharacterAction, addCharacterReferenceAction, removeCharacterReferenceAction } from "@/actions/characters";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export type CharacterItem = {
  id: string;
  name: string;
  description?: string;
  avatarUrl: string;
  createdAt: string;
  referenceCount?: number;
  referenceUrls?: string[];
};

export type CharactersViewProps = {
  characters: CharacterItem[];
  emptySlotsArray: unknown[];
  showLockedSlot: boolean;
  currentPage: number;
  totalPages: number;
};

export function CharactersView({ characters, emptySlotsArray, showLockedSlot, currentPage, totalPages }: CharactersViewProps) {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFiles([]);
    setName("");
    setDescription("");
    setError("");
    setIsCreateModalOpen(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Name is required.");
    if (files.length === 0) return setError("Upload at least 1 image.");

    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    files.forEach(f => formData.append("files", f));

    const res = await createCharacterAction(formData);
    if (res.error) {
      setError(res.error);
    } else {
      resetForm();
    }
    setIsSubmitting(false);
  };

  const handleDelete = (id: string, charName: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Delete Character",
      description: `Are you sure you want to delete ${charName}? This cannot be undone.`,
      onConfirm: async () => {
        if (selectedCharacter?.id === id) {
          setSelectedCharacter(null);
        }
        const res = await deleteCharacterAction(id);
        if (res?.error) {
          alert(res.error);
        }
      }
    });
  };

  const handleUploadReference = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !selectedCharacter) return;
    
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large (max 10MB)");
      return;
    }

    setIsUploadingReference(true);
    const formData = new FormData();
    formData.append("characterId", selectedCharacter.id);
    formData.append("file", file);

    const res = await addCharacterReferenceAction(formData);
    if (res.error) {
      alert(res.error);
    } else if (res.newUrl) {
      // Update local state to show the new image instantly
      const newUrls = [...(selectedCharacter.referenceUrls || []), res.newUrl];
      setSelectedCharacter({
        ...selectedCharacter,
        referenceUrls: newUrls
      });
      router.refresh();
    }
    
    setIsUploadingReference(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveReference = (urlToRemove: string) => {
    if (!selectedCharacter) return;
    if (selectedCharacter.referenceUrls && selectedCharacter.referenceUrls.length <= 1) {
      alert("Cannot remove the last reference image.");
      return;
    }

    setConfirmModalConfig({
      isOpen: true,
      title: "Remove Reference Image",
      description: "Are you sure you want to remove this image from the character's references?",
      onConfirm: async () => {
        const res = await removeCharacterReferenceAction(selectedCharacter.id, urlToRemove);
        if (res.error) {
          alert(res.error);
        } else if (res.newUrls && res.newAvatarUrl) {
          setSelectedCharacter({
            ...selectedCharacter,
            referenceUrls: res.newUrls,
            avatarUrl: res.newAvatarUrl,
          });
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Characters</h1>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Create consistent characters. Save up to 5 reference images to use in the Studio.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="btn-primary gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4" />
            Create Character
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* 1. Render Actual Characters */}
        {characters.map((char) => (
          <Card 
            key={char.id} 
            className="overflow-hidden group flex flex-col cursor-pointer border border-neutral-400 dark:border-neutral-500 bg-muted hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => setSelectedCharacter(char)}
          >
            <div className="aspect-square w-full relative bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={char.avatarUrl} 
                alt={char.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Hover Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button 
                  className="btn-ghost btn-icon size-8 rounded-full bg-black/40 hover:bg-destructive/80 text-white backdrop-blur transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(char.id, char.name);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <CardBody className="p-4 flex-1 flex flex-col bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-base line-clamp-1">{char.name}</h3>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">
                  <ImageIcon className="size-3" />
                  <span>{char.referenceCount}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                {char.description || "No description."}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {char.createdAt}
              </p>
            </CardBody>
          </Card>
        ))}

        {/* 2. Render Empty Slots (Visual Only) */}
        {emptySlotsArray.map((_, i) => (
          <Card 
            key={`empty-${i}`} 
            className="overflow-hidden flex flex-col border-dashed border-2 border-neutral-400 dark:border-neutral-500 bg-transparent opacity-60 cursor-pointer hover:opacity-100 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 group"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="aspect-square w-full bg-muted/20 flex flex-col items-center justify-center gap-3 group-hover:bg-muted/40 transition-colors">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Empty Slot</span>
            </div>
            <CardBody className="p-4 flex-1 flex flex-col items-center justify-center text-center bg-card">
              <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Click to create</p>
            </CardBody>
          </Card>
        ))}

        {/* 3. Render 1 Locked Slot (Upsell) */}
        {showLockedSlot && (
          <Card className="overflow-hidden flex flex-col border-dashed border-2 border-neutral-400 dark:border-neutral-500 bg-transparent opacity-40 shadow-sm">
            <div className="aspect-square w-full bg-muted/10 flex flex-col items-center justify-center gap-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Locked Slot</span>
            </div>
            <CardBody className="p-4 flex-1 flex flex-col items-center justify-center text-center gap-2 bg-card">
              <Button className="btn-outline w-full text-xs h-8">
                Upgrade
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/dashboard/characters" />

      {/* Character View Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md relative flex flex-col max-h-[90vh]">
            <Button 
              className="btn-ghost btn-icon absolute top-3 right-3 z-10 size-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setSelectedCharacter(null)}
            >
              ✕
            </Button>
            
            <div className="w-full bg-muted shrink-0 flex flex-col">
              <div className="w-full h-64 md:h-80 relative flex items-center justify-center bg-black/5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedCharacter.avatarUrl} 
                  alt={selectedCharacter.name}
                  className="max-w-full max-h-full object-contain"
                />
                <a 
                  href={selectedCharacter.avatarUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-14 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="View full image"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
              
              <div className="flex gap-2 p-3 overflow-x-auto bg-card border-b border-border hide-scrollbar min-h-[110px]">
                {[0, 1, 2, 3, 4].map((i) => {
                  const url = selectedCharacter.referenceUrls?.[i];
                  return (
                    <div key={i} className="w-16 h-[92px] shrink-0 flex flex-col items-center gap-1 group">
                      {url ? (
                        <>
                          <button 
                            className="size-6 rounded-full flex items-center justify-center hover:bg-destructive hover:text-white text-muted-foreground transition-colors shrink-0"
                            onClick={() => handleRemoveReference(url)}
                            title="Remove image"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                          <div className="w-full h-16 relative rounded-md border border-border overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={url} 
                              alt={`Reference ${i+1}`} 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedCharacter({ ...selectedCharacter, avatarUrl: url })}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="size-6 shrink-0" /> {/* Spacer for alignment */}
                          <div 
                            className={`w-full h-16 rounded-md border-2 border-dashed border-neutral-400 dark:border-neutral-500 flex items-center justify-center shrink-0 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors ${isUploadingReference ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className="size-4 text-muted-foreground" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleUploadReference}
              />
            </div>
            
            <CardBody className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <h2 className="text-2xl font-bold">{selectedCharacter.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">Created {selectedCharacter.createdAt}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Description / Prompt</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedCharacter.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 border-t mt-auto flex gap-3">
                <Button className="btn-outline flex-1" onClick={() => setSelectedCharacter(null)}>Close</Button>
                <Button 
                  className="bg-destructive hover:bg-destructive/90 text-white flex-1 gap-2"
                  onClick={() => handleDelete(selectedCharacter.id, selectedCharacter.name)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Create Character Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg relative flex flex-col max-h-[90vh]">
            <Button 
              className="btn-ghost btn-icon absolute top-3 right-3 z-10 size-8 rounded-full bg-muted hover:bg-muted-foreground/10"
              onClick={() => setIsCreateModalOpen(false)}
            >
              ✕
            </Button>
            
            <CardBody className="p-6 md:p-8 flex flex-col gap-5 overflow-y-auto">
              <div>
                <CardTitle className="text-2xl">Create New Character</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload 1-4 clear photos of the face and give it a name.
                </p>
              </div>

              {/* Upload Zone */}
              <div className="mt-2">
                <StudioImageUpload files={files} onFilesChange={setFiles} />
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Brief details to remember..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 mt-2">
                <Button className="btn-outline" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button className="btn-primary gap-2" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="opacity-70">Saving...</span>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Save Character
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig({ ...confirmModalConfig, isOpen: false })}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        isDestructive={true}
        confirmText="Delete"
      />
    </div>
  );
}
