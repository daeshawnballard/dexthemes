import fs from "node:fs";
import path from "node:path";

const DEFAULT_DOMAIN = "dexthemes.com";
const DEFAULT_APEX_IP = "216.198.79.1";
const DEFAULT_WWW_CNAME = "52cfd5896b2df691.vercel-dns-017.com";
const DEFAULT_API_BASE = "https://api.namecheap.com/xml.response";

loadEnvFile(path.resolve(".env.local"));
loadEnvFile(path.resolve(".env.namecheap.local"));

const domain = process.env.TARGET_DOMAIN || DEFAULT_DOMAIN;
const apexIp = process.env.VERCEL_APEX_IP || DEFAULT_APEX_IP;
const wwwCname = stripTrailingDot(process.env.VERCEL_WWW_CNAME || DEFAULT_WWW_CNAME);
const apiBase = process.env.NAMECHEAP_API_BASE || DEFAULT_API_BASE;

const apiUser = requiredEnv("NAMECHEAP_API_USER");
const apiKey = requiredEnv("NAMECHEAP_API_KEY");
const username = process.env.NAMECHEAP_USERNAME || apiUser;
const clientIp = requiredEnv("NAMECHEAP_CLIENT_IP");

const { sld, tld } = splitDomain(domain);

const desiredHosts = [
  createHost("@", "A", apexIp),
  createHost("www", "CNAME", wwwCname),
];

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

async function main() {
  const existingHosts = await getHosts();
  const mergedHosts = mergeHosts(existingHosts, desiredHosts);

  console.log(`Syncing ${domain} against ${apiBase}`);
  console.log("Desired records:");
  for (const host of desiredHosts) {
    console.log(`- ${host.Name} ${host.Type} ${host.Address}`);
  }

  await setHosts(mergedHosts);

  console.log(`Updated ${domain} DNS in Namecheap.`);
}

async function getHosts() {
  const xml = await namecheapRequest("namecheap.domains.dns.getHosts", {
    SLD: sld,
    TLD: tld,
  });

  const isUsingOurDns = matchAttribute(xml, "DomainDNSGetHostsResult", "IsUsingOurDNS");
  if (isUsingOurDns === "false") {
    throw new Error(`Namecheap API reported ${domain} is not using Namecheap BasicDNS.`);
  }

  return parseHosts(xml);
}

async function setHosts(hosts) {
  const params = {
    SLD: sld,
    TLD: tld,
  };

  hosts.forEach((host, index) => {
    const position = index + 1;
    params[`HostName${position}`] = host.Name;
    params[`RecordType${position}`] = host.Type;
    params[`Address${position}`] = host.Address;
    params[`MXPref${position}`] = host.MXPref ?? "10";
    params[`TTL${position}`] = host.TTL ?? "1800";
  });

  await namecheapRequest("namecheap.domains.dns.setHosts", params, "POST");
}

async function namecheapRequest(command, extraParams, method = "GET") {
  const params = new URLSearchParams({
    ApiUser: apiUser,
    ApiKey: apiKey,
    UserName: username,
    ClientIp: clientIp,
    Command: command,
    ...extraParams,
  });

  const response = await fetch(
    method === "GET" ? `${apiBase}?${params.toString()}` : apiBase,
    method === "GET"
      ? undefined
      : {
          method,
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          body: params,
        },
  );

  const xml = await response.text();

  if (!response.ok) {
    throw new Error(`Namecheap API request failed with ${response.status}: ${xml}`);
  }

  const errors = parseErrors(xml);
  if (errors.length > 0) {
    throw new Error(`Namecheap API error: ${errors.join("; ")}`);
  }

  return xml;
}

function mergeHosts(existingHosts, desiredRecords) {
  const merged = existingHosts.filter((host) => {
    return !desiredRecords.some((desired) => shouldReplace(host, desired));
  });

  return [...merged, ...desiredRecords];
}

function shouldReplace(existing, desired) {
  if (normalizeHostName(existing.Name) !== normalizeHostName(desired.Name)) {
    return false;
  }

  if (existing.Type === "CNAME" || desired.Type === "CNAME") {
    return true;
  }

  return existing.Type === desired.Type;
}

function createHost(name, type, address) {
  return {
    Name: normalizeHostName(name),
    Type: type.toUpperCase(),
    Address: stripTrailingDot(address),
    MXPref: "10",
    TTL: "1800",
  };
}

function parseHosts(xml) {
  const hosts = [];
  const hostPattern = /<host\b([^>]*)\/>/gi;

  for (const match of xml.matchAll(hostPattern)) {
    const attrs = parseAttributes(match[1]);
    if (!attrs.Name || !attrs.Type || !attrs.Address) {
      continue;
    }

    hosts.push({
      Name: normalizeHostName(attrs.Name),
      Type: attrs.Type.toUpperCase(),
      Address: stripTrailingDot(attrs.Address),
      MXPref: attrs.MXPref || "10",
      TTL: attrs.TTL || "1800",
    });
  }

  return hosts;
}

function parseErrors(xml) {
  return [...xml.matchAll(/<Error(?:\s+Number="[^"]*")?>([\s\S]*?)<\/Error>/gi)]
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean);
}

function parseAttributes(input) {
  const attrs = {};

  for (const match of input.matchAll(/([A-Za-z0-9:_-]+)="([^"]*)"/g)) {
    attrs[match[1]] = decodeXml(match[2]);
  }

  return attrs;
}

function matchAttribute(xml, tagName, attributeName) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "i");
  const match = xml.match(pattern);
  if (!match) {
    return null;
  }

  const attrs = parseAttributes(match[1]);
  return attrs[attributeName] ?? null;
}

function splitDomain(value) {
  const parts = value.split(".").filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Invalid domain: ${value}`);
  }

  return {
    sld: parts[parts.length - 2],
    tld: parts[parts.length - 1],
  };
}

function normalizeHostName(value) {
  return value === "" ? "@" : value;
}

function stripTrailingDot(value) {
  return value.replace(/\.$/, "");
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function decodeXml(value) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
