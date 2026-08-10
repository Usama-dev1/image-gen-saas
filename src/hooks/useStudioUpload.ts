import { useState } from "react";
import { getUploadSignatureAction } from "@/actions/upload";

export function useStudioUpload() {
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);

  const uploadReferences = async () => {
    if (referenceFiles.length === 0) return { referenceImages: [], uploadedPublicIds: [] };

    const sigRes = await getUploadSignatureAction();
    if (sigRes.error || !sigRes.signature) {
      throw new Error("Failed to get upload signature");
    }

    const uploadPromises = referenceFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigRes.apiKey!);
      formData.append("timestamp", sigRes.timestamp!.toString());
      formData.append("signature", sigRes.signature!);
      formData.append("folder", sigRes.folder!);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`;
      const uploadRes = await fetch(cloudinaryUrl, { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.error.message);
      
      return { url: uploadData.secure_url, publicId: uploadData.public_id };
    });

    const uploadResults = await Promise.all(uploadPromises);
    return {
      referenceImages: uploadResults.map(r => r.url),
      uploadedPublicIds: uploadResults.map(r => r.publicId)
    };
  };

  return {
    referenceFiles,
    setReferenceFiles,
    uploadReferences
  };
}
