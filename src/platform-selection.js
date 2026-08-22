import { DEFAULT_PLATFORM_ID, normalizeWebsitePlatformId } from '../shared/platform-registry.js';

export function resolveSelectedPlatformId({
  urlPlatformId,
  hasUrlPlatform = false,
  storedPlatformId,
} = {}) {
  if (hasUrlPlatform) {
    return normalizeWebsitePlatformId(urlPlatformId);
  }
  return normalizeWebsitePlatformId(storedPlatformId);
}
