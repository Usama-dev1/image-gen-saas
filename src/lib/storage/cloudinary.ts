import { v2 as cloudinary } from "cloudinary";
import { StorageAdapter, UploadOptions, UploadResult } from "../adapters/storage";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CloudinaryAdapter: StorageAdapter = {
  uploadFile: async (file: Buffer | string, options: UploadOptions): Promise<UploadResult> => {
    const uploadOptions = {
      folder: options.folder,
      resource_type: options.resourceType || "auto",
      format: options.format,
    };

    let result;
    if (Buffer.isBuffer(file)) {
      // Stream upload still requires a Promise wrapper in v2
      result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, res) => {
            if (error) return reject(error);
            if (!res) return reject(new Error("No result from Cloudinary"));
            resolve(res);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // Native async/await for string URLs
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  },

  deleteFile: async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  },
};
