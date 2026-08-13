const ENDPOINT = "/api/generate-theme";
const SAFE_ERROR_MESSAGES = Object.freeze({
  invalid_request: "Describe the theme you want, then try again.",
  request_too_large: "That description is too long. Shorten it and try again.",
  rate_limited: "Too many theme requests. Continue in the manual builder or try again later.",
  rate_limit_unavailable: "Theme generation is temporarily unavailable. Continue in the manual builder or try again later.",
  generation_cancelled: "Theme generation was cancelled.",
  generation_timeout: "Theme generation took too long. Continue in the manual builder or try again.",
  generation_refused: "That theme could not be generated. Try a different description or use the manual builder.",
  generation_incomplete: "The theme was not finished. Try again or use the manual builder.",
  generation_invalid: "The generated theme was invalid. Try again or use the manual builder.",
  generation_unavailable: "Theme generation is temporarily unavailable. Continue in the manual builder or try again later.",
  invalid_response: "Theme generation returned an invalid response. Continue in the manual builder or try again.",
});

export class LunaThemeApiError extends Error {
  constructor(code, { status = 0, retryAfter = null } = {}) {
    const safeCode = Object.hasOwn(SAFE_ERROR_MESSAGES, code) ? code : "generation_unavailable";
    super(SAFE_ERROR_MESSAGES[safeCode]);
    this.name = "LunaThemeApiError";
    this.code = safeCode;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function validSuccessPayload(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    && value.theme && typeof value.theme === "object" && !Array.isArray(value.theme)
    && value.validation && typeof value.validation === "object" && !Array.isArray(value.validation)
    && typeof value.validation.valid === "boolean"
    && Array.isArray(value.validation.errors)
    && value.validation.errors.every((item) => typeof item === "string")
    && Array.isArray(value.validation.warnings)
    && value.validation.warnings.every((item) => typeof item === "string")
    && value.model === "gpt-5.6-luna"
    && (value.requestId === undefined || (typeof value.requestId === "string" && value.requestId.length <= 120));
}

function safeServerCode(value) {
  const code = value?.error?.code;
  return typeof code === "string" && /^[a-z_]{1,64}$/.test(code) ? code : "generation_unavailable";
}

/**
 * Request a private, unpersisted Luna draft. The caller must keep Apply,
 * Save, and Publish behind separate user actions.
 */
export async function generateThemeDraft({ prompt, platformId, signal } = {}) {
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, platformId }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted || error?.name === "AbortError") {
      throw new LunaThemeApiError("generation_cancelled");
    }
    throw new LunaThemeApiError("generation_unavailable");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new LunaThemeApiError("invalid_response", { status: response.status });
  }

  if (!response.ok) {
    const retryAfterValue = Number(response.headers.get("retry-after"));
    throw new LunaThemeApiError(safeServerCode(payload), {
      status: response.status,
      retryAfter: Number.isFinite(retryAfterValue) ? retryAfterValue : null,
    });
  }
  if (!validSuccessPayload(payload)) {
    throw new LunaThemeApiError("invalid_response", { status: response.status });
  }

  return Object.freeze({
    theme: payload.theme,
    validation: payload.validation,
    model: payload.model,
    ...(payload.requestId ? { requestId: payload.requestId } : {}),
  });
}
