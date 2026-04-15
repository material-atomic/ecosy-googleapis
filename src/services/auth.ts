import type { HttpInterceptorRequest } from "@ecosy/core/http";
import type { GoogleAuthConfig, CachedToken } from "../types";
import { createSignedJWT } from "../lib/jwt";

const TOKEN_MARGIN = 5 * 60 * 1000;

let tokenCache: CachedToken | null = null;

async function getAccessToken(config: GoogleAuthConfig): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now + TOKEN_MARGIN) {
    return tokenCache.accessToken;
  }

  const jwt = await createSignedJWT(config.email, config.privateKey, config.scope);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OAuth2 token exchange failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

export function createAuthInterceptor(config: GoogleAuthConfig): HttpInterceptorRequest {
  return async (options) => {
    const headers = (options.headers || {}) as Record<string, string>;
    if (headers["Authorization"]) return options;

    const token = await getAccessToken(config);

    return {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${token}` },
    };
  };
}

export function invalidateTokenCache() {
  tokenCache = null;
}
