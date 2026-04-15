# @ecosy/googleapis

Google APIs client (Drive, OAuth2, JWT) built on top of [`@ecosy/core/http`](https://github.com/material-atomic/ecosy-core). Works in Cloudflare Workers, Deno, Bun, Node, and modern browsers — authentication relies exclusively on the Web Crypto API.

## Installation

```bash
yarn add @ecosy/googleapis @ecosy/core
```

> **Note:** `@ecosy/core` ≥ 0.3.0 is required (for `Endpoint`, `HttpUpload`, and the `related()` upload method).

## Subpath imports

| Entry point                           | Description                                 |
| ------------------------------------- | ------------------------------------------- |
| `@ecosy/googleapis`                   | Re-exports all services and types           |
| `@ecosy/googleapis/services/drive`    | Drive HTTP clients and file operations      |
| `@ecosy/googleapis/services/auth`     | OAuth2 interceptor and token cache control  |
| `@ecosy/googleapis/lib/jwt`           | `createSignedJWT` — RS256 via Web Crypto    |
| `@ecosy/googleapis/types`             | TypeScript types                            |

## Quick start

```ts
import {
  initDriveAuth,
  DriveService,
  uploadFileToDrive,
  trashFile,
  deleteFile,
} from "@ecosy/googleapis";

// 1. Wire the service-account credentials once at boot.
initDriveAuth({
  email: SERVICE_ACCOUNT_EMAIL,
  privateKey: PRIVATE_KEY_PEM,
  scope: "https://www.googleapis.com/auth/drive",
});

// 2. Use the Drive API.
const { data: list } = await DriveService.findFiles.fn({
  q: "'FOLDER_ID' in parents and trashed = false",
  fields: "files(id,name,mimeType)",
});

const { data: created } = await DriveService.createFile.fn({
  name: "note.txt",
  mimeType: "text/plain",
  parents: ["FOLDER_ID"],
});

// 3. Upload binary content with multipart/related.
await uploadFileToDrive("photo.jpg", "image/jpeg", bytes, "FOLDER_ID");

// 4. Trash or delete.
await trashFile(fileId);
await deleteFile(fileId);
```

## API

### Auth

- **`initDriveAuth(config)`** — install the OAuth2 interceptor on `driveHttp` and `uploadHttp`. Idempotent.
- **`createAuthInterceptor(config)`** — returns an `HttpInterceptorRequest` that injects `Authorization: Bearer <token>`. Tokens are cached in-memory with a 5-minute safety margin. Persistent caching (Redis, KV, disk, …) is an app-level concern and is not handled by this library.
- **`invalidateTokenCache()`** — clear the in-memory token cache (e.g. after a 401).

```ts
interface GoogleAuthConfig {
  email: string;      // service-account client_email
  privateKey: string; // service-account private_key (PEM)
  scope: string;      // OAuth scopes, space-separated
}
```

### Drive

- **`driveHttp`** / **`uploadHttp`** — pre-configured `Http` instances pointing at `drive/v3` and `upload/drive/v3`.
- **`DriveService`** — typed endpoint factory:
  - `DriveService.createFile.fn(payload)`
  - `DriveService.findFiles.fn(params)`
  - `DriveService.getStorageQuota.fn()`
- **`uploadFileToDrive(name, mimeType, bytes, folderId)`** — `multipart/related` upload, returns the created `DriveFile`.
- **`trashFile(fileId)`** — soft-delete by setting `trashed: true`.
- **`deleteFile(fileId)`** — hard-delete.
- **`getFileContent(fileId)`** — download as string.
- **`updateFileContent(fileId, content, mimeType?)`** — media upload to an existing file.

Endpoints are registered via `Endpoint.register("drive", …)` from `@ecosy/core/http`, so custom factories can extend them.

### JWT

- **`createSignedJWT(email, privateKey, scope)`** — sign an RS256 JWT for the Google OAuth2 token exchange. Uses Web Crypto only; no Node built-ins.

### Types

`GoogleAuthConfig`, `CachedToken`, `DriveFile`, `DriveFileList`, `StorageQuota`, `FindFilesParams`, `CreateFilePayload`, `DeletedPhotoEntry`, `TrackingData`.

## Related packages

| Package | Description |
|--|--|
| [`@ecosy/core`](https://github.com/material-atomic/ecosy-core) | Http client, Endpoint registry, utilities |

## License

MIT
