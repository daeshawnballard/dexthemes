import { DEFAULT_PLATFORM_ID, normalizePlatformId } from '../shared/platform-registry.js';

export function resolveSelectedPlatformId({
  urlPlatformId,
  hasUrlPlatform = false,
  storedPlatformId,
} = {}) {
  if (hasUrlPlatform) {
    return normalizePlatformId(urlPlatformId) || DEFAULT_PLATFORM_ID;
  }
  return normalizePlatformId(storedPlatformId) || DEFAULT_PLATFORM_ID;
}
