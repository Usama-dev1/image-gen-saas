"use server";

import { v2 as cloudinary } from "cloudinary";
import { authGuard } from "@/lib/auth-guard";
import { CloudinaryAdapter } from "@/lib/storage/cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getUploadSignatureAction() {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (e) {
    return { error: "Unauthorized" };
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "temp-studio-uploads";
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    success: true,
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

export async function deleteTempImagesAction(publicIds: string[]) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (e) {
    return { error: "Unauthorized" };
  }

  try {
    const deletePromises = publicIds.map((id) => CloudinaryAdapter.deleteFile(id));
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete temp images:", error);
    return { error: error.message };
  }
}
