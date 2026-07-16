import { MCP_RESOURCE } from "../server/dexthemes-mcp.js";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const issuer = process.env.DEXTHEMES_AUTH_ISSUER;
  if (!issuer) return res.status(503).json({ error: "OAuth authorization server is not configured" });
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).json({
    resource: MCP_RESOURCE,
    authorization_servers: [issuer.endsWith("/") ? issuer : `${issuer}/`],
    scopes_supported: ["themes:read", "themes:write"],
    bearer_methods_supported: ["header"],
    resource_name: "DexThemes",
    resource_documentation: "https://www.dexthemes.com/support.html",
  });
}
