import { Http, HttpMethod, Endpoint, type HttpResponse } from "@ecosy/core/http";
import type {
  GoogleAuthConfig,
  DriveFile,
  DriveFileList,
  StorageQuota,
  CreateFilePayload,
  FindFilesParams,
} from "../types";
import { createAuthInterceptor } from "./auth";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";

export const driveHttp = new Http(DRIVE_API_BASE);
export const uploadHttp = new Http(UPLOAD_API_BASE);

Endpoint.register("drive", {
  createFile: "files?fields=id,name,webViewLink",
  findFiles: "files",
  about: "about?fields=storageQuota",
});

const driveFactory = Http.createFactory({
  http: driveHttp,
  endpoint: () => Endpoint.all(),
});

let authInitialized = false;

export function initDriveAuth(config: GoogleAuthConfig) {
  if (authInitialized) return;
  const interceptor = createAuthInterceptor(config);
  driveHttp.on("request", interceptor);
  uploadHttp.on("request", interceptor);
  authInitialized = true;
}

export const DriveService = {
  createFile: driveFactory<DriveFile, [CreateFilePayload]>(
    "drive.createFile",
    HttpMethod.POST
  ),
  findFiles: driveFactory<DriveFileList, [FindFilesParams]>(
    "drive.findFiles",
    HttpMethod.GET
  ),
  getStorageQuota: driveFactory<StorageQuota, []>(
    "drive.about",
    HttpMethod.GET
  ),
};

export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  fileData: ArrayBuffer | Uint8Array,
  folderId: string
): Promise<HttpResponse<DriveFile>> {
  return uploadHttp.related<DriveFile>(
    "files?uploadType=multipart&fields=id,name,webViewLink,size,mimeType,createdTime",
    fileData,
    {
      metadata: { name: fileName, parents: [folderId] },
      contentType: mimeType,
    }
  );
}

export async function trashFile(fileId: string): Promise<HttpResponse<DriveFile>> {
  return driveHttp.patch<DriveFile>(`files/${fileId}?fields=id,name,trashed`, { trashed: true });
}

export async function deleteFile(fileId: string): Promise<HttpResponse<void>> {
  return driveHttp.delete<void>(`files/${fileId}`);
}

export async function getFileContent(fileId: string): Promise<HttpResponse<string>> {
  return driveHttp.get<string>(`files/${fileId}?alt=media`);
}

export async function updateFileContent(
  fileId: string,
  content: string,
  mimeType: string = "application/json"
): Promise<HttpResponse<DriveFile>> {
  return uploadHttp.patch<DriveFile>(
    `files/${fileId}?uploadType=media&fields=id,name,modifiedTime`,
    content,
    { headers: { "Content-Type": mimeType } }
  );
}
