# Changelog

## 0.1.0 (2026-04-15)

Initial release.

### Features

- **Drive**: `driveHttp` / `uploadHttp` Http instances pre-pointed at `drive/v3` and `upload/drive/v3`, with endpoints registered via `Endpoint.register("drive", …)`
- **Drive**: `DriveService` typed factory for `createFile`, `findFiles`, `getStorageQuota`
- **Drive**: `uploadFileToDrive(name, mimeType, bytes, folderId)` — `multipart/related` upload backed by `Http#related()`
- **Drive**: `trashFile`, `deleteFile`, `getFileContent`, `updateFileContent` helpers
- **Auth**: `createAuthInterceptor(config)` — OAuth2 Bearer-token interceptor with in-memory token cache and 5-minute safety margin. Persistent caching is left to the application layer
- **Auth**: `initDriveAuth(config)` — idempotent one-shot wiring for both Http clients
- **Auth**: `invalidateTokenCache()` — clear in-memory token cache
- **JWT**: `createSignedJWT(email, privateKey, scope)` — RS256 signing via Web Crypto (works on Workers, Deno, Bun, browsers — no Node built-ins)
- **Types**: `GoogleAuthConfig`, `CachedToken`, `DriveFile`, `DriveFileList`, `StorageQuota`, `FindFilesParams`, `CreateFilePayload`, `DeletedPhotoEntry`, `TrackingData`
