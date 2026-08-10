import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Character as CharacterModel } from "@/models/Character";
import { CharactersView, CharacterItem } from "./CharactersView";

export type CharactersContainerProps = {
  page?: number;
};

export async function CharactersContainer({ page = 1 }: CharactersContainerProps) {
  const userId = await authGuard();
  await connectDB();

  // 1. Fetch user to determine limits
  const user = await User.findById(userId).select("limits").lean();
  const characterLimit = user?.limits?.maxCharacters || 3;

  // 2. Pagination setup
  const limit = 10;
  const skip = (page - 1) * limit;

  // 3. Fetch characters count and list
  const totalCharacters = await CharacterModel.countDocuments({ userId, isDeleted: { $ne: true } });
  
  // Total virtual items (real characters + empty slots + 1 locked slot)
  const totalVirtualItems = characterLimit + 1;
  const totalPages = Math.ceil(totalVirtualItems / limit);

  const rawCharacters = await CharacterModel.find({ userId, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const characters: CharacterItem[] = rawCharacters.map((char: any) => ({
    id: char._id.toString(),
    name: char.name,
    description: char.description,
    avatarUrl: char.avatarUrl || char.referenceUrls?.[0] || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    createdAt: new Date(char.createdAt).toLocaleDateString(),
    referenceCount: char.referenceUrls?.length || 0,
    referenceUrls: char.referenceUrls || [],
  }));

  let emptySlotsCount = 0;
  let showLockedSlot = false;

  for (let i = skip; i < skip + limit; i++) {
    if (i >= totalCharacters && i < characterLimit) {
      emptySlotsCount++;
    } else if (i === characterLimit) {
      showLockedSlot = true;
    }
  }

  const emptySlotsArray = Array.from({ length: emptySlotsCount });

  return (
    <CharactersView 
      characters={characters} 
      emptySlotsArray={emptySlotsArray}
      showLockedSlot={showLockedSlot}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
