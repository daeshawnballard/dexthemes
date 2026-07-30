import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  CANONICAL_HOST,
  CANONICAL_ORIGIN,
  INDEXNOW_KEY,
  INDEXNOW_KEY_PATH,
} from "../shared/seo.js";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export const notifyThemePublished = internalAction({
  args: {
    themeId: v.string(),
    hasDark: v.boolean(),
    hasLight: v.boolean(),
  },
  handler: async (_ctx, args) => {
    const urlList = [
      ...(args.hasDark ? [`${CANONICAL_ORIGIN}/${encodeURIComponent(args.themeId)}/dark`] : []),
      ...(args.hasLight ? [`${CANONICAL_ORIGIN}/${encodeURIComponent(args.themeId)}/light`] : []),
      `${CANONICAL_ORIGIN}/collections/community`,
      `${CANONICAL_ORIGIN}/sitemap.xml`,
    ];

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: CANONICAL_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${CANONICAL_ORIGIN}${INDEXNOW_KEY_PATH}`,
        urlList,
      }),
    });

    if (!response.ok) {
      throw new Error(`IndexNow submission failed with status ${response.status}`);
    }

    return { accepted: true, status: response.status, urlCount: urlList.length };
  },
});
