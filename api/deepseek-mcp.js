import { handleMcpRequest } from "./mcp.js";

/**
 * Anonymous, read-only MCP profile for DeepSeek Harness.
 * The generic Harness bridge does not enforce MCP auth or app visibility, so
 * this endpoint exposes only the explicitly allowlisted public tool subset.
 */
export default async function handler(req, res) {
  return handleMcpRequest(req, res, {
    profile: "deepseek_harness",
    allowAuthorization: false,
  });
}
