"use server";

import { authGuard } from "@/lib/auth-guard";
import { Character } from "@/models/Character";
import { User } from "@/models/User";
import { CloudinaryAdapter } from "@/lib/storage/cloudinary";
import connectDB from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCharacterAction(formData: FormData) {
  try {
    const userId = await authGuard();
    await connectDB();

    // 1. Check user limits
    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found." };
    }

    const currentCount = await Character.countDocuments({ userId, isDeleted: { $ne: true } });
    const limit = user.limits?.maxCharacters || 3;

    if (currentCount >= limit) {
      return { error: "Character limit reached. Please upgrade to create more." };
    }

    // 2. Parse form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("files") as File[];

    if (!name || name.trim().length === 0) {
      return { error: "Name is required." };
    }
    if (!files || files.length === 0) {
      return { error: "At least one reference image is required." };
    }

    // 3. Upload images to Cloudinary
    const referenceUrls: string[] = [];
    let avatarUrl = "";
    
    // Process files sequentially or parallel. Parallel is faster.
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await CloudinaryAdapter.uploadFile(buffer, {
        folder: `users/${userId}/characters`,
        resourceType: "image"
      });
      return result.secureUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    
    if (uploadedUrls.length > 0) {
      avatarUrl = uploadedUrls[0];
      referenceUrls.push(...uploadedUrls);
    }

    // 4. Save to DB
    const newChar = await Character.create({
      userId,
      name,
      description,
      avatarUrl,
      referenceUrls,
    });

    // 5. Revalidate
    revalidatePath("/dashboard/characters");

    return { success: true, characterId: newChar._id.toString() };
  } catch (error: any) {
    console.error("[createCharacterAction] Error:", error);
    return { error: error.message || "Failed to create character." };
  }
}
export async function saveGeneratedCharacterAction({ name, description, imageUrl }: { name: string, description?: string, imageUrl: string }) {
  try {
    const userId = await authGuard();
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return { error: "User not found." };

    const currentCount = await Character.countDocuments({ userId, isDeleted: { $ne: true } });
    const limit = user.limits?.maxCharacters || 3;

    if (currentCount >= limit) {
      return { error: "Character limit reached. Please upgrade to create more." };
    }

    if (!name || name.trim().length === 0) return { error: "Name is required." };
    if (!imageUrl) return { error: "Image URL is required." };

    const newChar = await Character.create({
      userId,
      name,
      description: description || "",
      avatarUrl: imageUrl,
      referenceUrls: [imageUrl],
    });

    revalidatePath("/dashboard/characters");
    revalidatePath("/dashboard/studio"); // Need to revalidate studio to update the dropdown

    return { success: true, characterId: newChar._id.toString() };
  } catch (error: any) {
    console.error("[saveGeneratedCharacterAction] Error:", error);
    return { error: error.message || "Failed to save character." };
  }
}

export async function addCharacterReferenceAction(formData: FormData) {
  try {
    const userId = await authGuard();
    await connectDB();

    const characterId = formData.get("characterId") as string;
    const file = formData.get("file") as File;

    if (!characterId || !file) {
      return { error: "Missing required fields." };
    }

    const char = await Character.findOne({ _id: characterId, userId, isDeleted: { $ne: true } });
    if (!char) {
      return { error: "Character not found." };
    }

    if (char.referenceUrls && char.referenceUrls.length >= 5) {
      return { error: "Maximum of 5 reference images allowed." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await CloudinaryAdapter.uploadFile(buffer, {
      folder: `users/${userId}/characters`,
      resourceType: "image"
    });

    char.referenceUrls.push(result.secureUrl);
    await char.save();

    revalidatePath("/dashboard/characters");
    revalidatePath("/dashboard/studio");

    return { success: true, newUrl: result.secureUrl };
  } catch (error: any) {
    console.error("[addCharacterReferenceAction] Error:", error);
    return { error: error.message || "Failed to add reference image." };
  }
}

export async function removeCharacterReferenceAction(characterId: string, imageUrl: string) {
  try {
    const userId = await authGuard();
    await connectDB();

    if (!characterId || !imageUrl) {
      return { error: "Missing required fields." };
    }

    const char = await Character.findOne({ _id: characterId, userId, isDeleted: { $ne: true } });
    if (!char) {
      return { error: "Character not found." };
    }

    // Don't allow removing the very last reference image
    if (char.referenceUrls && char.referenceUrls.length <= 1) {
      return { error: "Cannot remove the last reference image." };
    }

    char.referenceUrls = char.referenceUrls.filter((url: string) => url !== imageUrl);
    
    // If we removed the avatarUrl, pick the next available one
    if (char.avatarUrl === imageUrl && char.referenceUrls.length > 0) {
      char.avatarUrl = char.referenceUrls[0];
    }

    await char.save();

    revalidatePath("/dashboard/characters");
    revalidatePath("/dashboard/studio");

    return { success: true, newUrls: char.referenceUrls, newAvatarUrl: char.avatarUrl };
  } catch (error: any) {
    console.error("[removeCharacterReferenceAction] Error:", error);
    return { error: error.message || "Failed to remove reference image." };
  }
}

export async function deleteCharacterAction(characterId: string) {
  try {
    const userId = await authGuard();
    await connectDB();

    // Soft delete
    const result = await Character.findOneAndUpdate(
      { _id: characterId, userId },
      { $set: { isDeleted: true } }
    );

    if (!result) {
      return { error: "Character not found or not authorized." };
    }

    revalidatePath("/dashboard/characters");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteCharacterAction] Error:", error);
    return { error: error.message || "Failed to delete character." };
  }
}
