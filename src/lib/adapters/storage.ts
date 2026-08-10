export type UploadOptions = {
  folder: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  format?: string;
}

export type UploadResult = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: string;
}

export type StorageAdapter = {
  uploadFile(file: Buffer | string, options: UploadOptions): Promise<UploadResult>;
  deleteFile(publicId: string): Promise<void>;
}
