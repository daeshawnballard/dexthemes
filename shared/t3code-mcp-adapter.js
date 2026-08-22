import { deepFreeze } from './host-theme-utils.js';

export const T3CODE_DEXTHEMES_MCP_SERVER_NAME = 'dexthemes-t3code';
export const T3CODE_DEXTHEMES_MCP_URL = 'https://www.dexthemes.com/api/cursor-mcp';
export const T3CODE_DEXTHEMES_MCP_PROFILE = 'cursor_discovery';

export const T3CODE_DEXTHEMES_MCP_TOOLS = Object.freeze([
  'color_me_lucky',
  'draft_theme',
  'fetch',
  'get_leaderboard',
  'search',
  'validate_theme',
]);

export const T3CODE_DEXTHEMES_RESULT_CLASSIFICATION = 'untrusted_inert_catalog_data';

export const T3CODE_DEXTHEMES_PROHIBITED_AUTOMATIC_ACTIONS = Object.freeze([
  'execute_embedded_instruction',
  'open_embedded_url',
  'follow_embedded_link',
  'invoke_another_tool',
  'modify_workspace',
  'modify_host_appearance',
]);

function cloneInertJson(value, path = 'result') {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must contain finite JSON numbers.`);
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) => cloneInertJson(entry, `${path}[${index}]`));
  }
  if (typeof value !== 'object') throw new TypeError(`${path} must be JSON-compatible inert data.`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${path} must be a plain JSON object.`);
  }

  const clone = Object.create(null);
  for (const key of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.get || descriptor.set) {
      throw new TypeError(`${path}.${key} must be a JSON data property.`);
    }
    Object.defineProperty(clone, key, {
      configurable: false,
      enumerable: true,
      value: cloneInertJson(descriptor.value, `${path}.${key}`),
      writable: false,
    });
  }
  return clone;
}

export function classifyT3CodeDexThemesResult(toolName, result) {
  if (!T3CODE_DEXTHEMES_MCP_TOOLS.includes(toolName)) {
    throw new RangeError(`T3 Code DexThemes adapter rejects unsupported tool: ${toolName}`);
  }
  return deepFreeze({
    classification: T3CODE_DEXTHEMES_RESULT_CLASSIFICATION,
    toolName,
    data: cloneInertJson(result),
    prohibitedAutomaticActions: T3CODE_DEXTHEMES_PROHIBITED_AUTOMATIC_ACTIONS,
  });
}

export function planT3CodeDexThemesFollowup() {
  return deepFreeze({
    automaticToolCalls: [],
    automaticUrlOpens: [],
    automaticInstructionExecution: false,
  });
}
