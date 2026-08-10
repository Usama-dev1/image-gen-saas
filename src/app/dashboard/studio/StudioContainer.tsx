import { StudioView } from "./StudioView";
import { SavedPrompt } from "@/models/SavedPrompt";
import connectDB from "@/lib/db";
import { authGuard } from "@/lib/auth-guard";
import { Suspense } from "react";
import { Character } from "@/models/Character";

export async function StudioContainer() {
  const userId = await authGuard();
  await connectDB();

  const userPrompts = await SavedPrompt.find({ userId }).lean();
  
  const systemTemplates = [
    { id: "sys-1", title: "Cinematic Portrait", prompt: "A highly detailed cinematic portrait, 85mm lens, dramatic lighting, sharp focus, hyperrealistic", isSystemTemplate: true },
    { id: "sys-2", title: "Anime Concept Art", prompt: "Studio Ghibli style anime concept art, vibrant colors, lush landscapes, highly detailed", isSystemTemplate: true },
  ];

  const mappedUserPrompts = userPrompts.map((doc: any) => ({
    id: doc._id.toString(),
    title: doc.title,
    prompt: doc.prompt,
    isSystemTemplate: false,
  }));

  const templates = [...systemTemplates, ...mappedUserPrompts];

  const rawCharacters = await Character.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
  const characters = rawCharacters.map((char: any) => ({
    id: char._id.toString(),
    name: char.name,
    referenceUrls: char.referenceUrls || [],
  }));

  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Loading Studio...</div>}>
      <StudioView templates={templates} characters={characters} />
    </Suspense>
  );
}
