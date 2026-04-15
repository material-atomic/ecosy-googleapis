// ─── Auth ────────────────────────────────────────────────────────

export interface GoogleAuthConfig {
  email: string;
  privateKey: string;
  scope: string;
}

export interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

// ─── Drive ──────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  trashed?: boolean;
}

export interface DriveFileList {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface StorageQuota {
  storageQuota: {
    limit: string;
    usage: string;
    usageInDrive: string;
    usageInTrash: string;
  };
}

export interface FindFilesParams {
  q: string;
  fields: string;
  spaces?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
}

export interface CreateFilePayload {
  name: string;
  mimeType: string;
  parents: string[];
}

// ─── Tracking ───────────────────────────────────────────────────

export interface DeletedPhotoEntry {
  localAssetId: string;
  fileName: string;
  driveFileId: string;
  deletedAt: string;
  reportedAt: string;
  status: "pending_review" | "deleted_from_drive" | "kept_on_drive";
  resolvedAt?: string;
}

export interface TrackingData {
  deletedPhotos: DeletedPhotoEntry[];
  lastUpdated: string | null;
  totalPendingReview: number;
}
