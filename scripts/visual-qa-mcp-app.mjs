import { mkdir } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { THEME_PREVIEW_HTML } from "../server/generated/theme-preview-html.js";

const outputDir = path.resolve(process.argv[2] || ".artifacts/mcp-app-visual-qa");
await mkdir(outputDir, { recursive: true });

const theme = {
  id: "argentina-afterglow",
  themeId: "argentina-afterglow",
  name: "Argentina Afterglow",
  summary: "Argentina sky blues, stadium light, and deep midnight focus.",
  codeThemeId: { dark: "codex", light: "codex" },
  accents: ["#64B5F6", "#2A68B8"],
  dark: {
    surface: "#09111F",
    ink: "#F4F8FF",
    accent: "#64B5F6",
    contrast: 66,
    diffAdded: "#49CF8B",
    diffRemoved: "#F06B72",
    skill: "#D7B7FF",
    sidebar: "#060C17",
    codeBg: "#040914",
  },
  light: {
    surface: "#F6FAFF",
    ink: "#14243D",
    accent: "#2A68B8",
    contrast: 49,
    diffAdded: "#18834D",
    diffRemoved: "#B9323D",
    skill: "#7650B4",
    sidebar: "#EAF2FC",
    codeBg: "#E1ECF8",
  },
};
const fixture = { kind: "theme-draft", theme, needsNameConfirmation: false };
const leaderboardFixture = {
  kind: "leaderboard",
  daily: [{ ...theme, authorName: "Community Builder", copies: 8, rawCopies: 8, qualifiedAdoptions: 3, likes: 5 }],
  weekly: [{ ...theme, authorName: "Community Builder", copies: 24, rawCopies: 24, qualifiedAdoptions: 9, likes: 14 }],
  monthly: [{ ...theme, authorName: "Community Builder", copies: 13, rawCopies: 31, qualifiedAdoptions: 13, likes: 22 }],
  allTime: [{ ...theme, authorName: "Community Builder", copies: 182, likes: 64 }],
  periods: {},
};
const profileFixture = {
  kind: "my-stats",
  stats: {
    user: { username: "builder", displayName: "Dex Builder" },
    creatorTotals: { submittedThemes: 4, totalCopies: 286, totalLikes: 91, totalQualifiedAdoptions: 42 },
    leaderboard: {
      daily: { rank: 1, name: theme.name },
      weekly: { rank: 2, name: theme.name },
      monthly: { rank: 4, name: theme.name },
      allTime: { rank: 7, name: theme.name },
    },
    popularityWins: {
      daily: 6,
      weekly: 2,
      total: 8,
      recent: [
        { periodType: "daily", periodStart: Date.UTC(2026, 6, 15), themeId: theme.id, name: theme.name },
        { periodType: "weekly", periodStart: Date.UTC(2026, 6, 6), themeId: theme.id, name: theme.name },
      ],
    },
    achievements: [
      { action: "theme_of_day", themeId: "golden-hour", theme: { ...theme, id: "golden-hour", themeId: "golden-hour", name: "Golden Hour" } },
      { action: "theme_of_week", themeId: "headliner", theme: { ...theme, id: "headliner", themeId: "headliner", name: "Headliner" } },
      { action: "use_plugin", themeId: "plugged-in", theme: { ...theme, id: "plugged-in", themeId: "plugged-in", name: "Plugged In" } },
    ],
  },
};
const fixtureJson = JSON.stringify(fixture).replaceAll("<", "\\u003c");

const hostHtml = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#eceef3;font-family:system-ui,sans-serif}main{width:min(1080px,calc(100vw - 32px));margin:16px auto}iframe{display:block;width:100%;height:1040px;border:0;background:transparent}
</style></head><body><main><iframe id="widget" src="/widget"></iframe></main><script>
const fixture=${fixtureJson};
function respond(target,id,result){target.postMessage({jsonrpc:"2.0",id,result},"*")}
window.sendFixture=(payload)=>document.getElementById("widget").contentWindow.postMessage({jsonrpc:"2.0",method:"ui/notifications/tool-result",params:{content:[],structuredContent:payload}},"*");
window.addEventListener("message",(event)=>{
  const message=event.data;
  if(!message||message.jsonrpc!=="2.0")return;
  if(message.method==="ui/initialize"){
    respond(event.source,message.id,{protocolVersion:message.params.protocolVersion,hostCapabilities:{},hostInfo:{name:"DexThemes QA Host",version:"1.0.0"},hostContext:{theme:"light",displayMode:"inline"}});
    return;
  }
  if(message.method==="ui/notifications/initialized"){
    window.setTimeout(()=>window.sendFixture(fixture),40);
    return;
  }
  if(message.method==="tools/call"){
    const args=message.params.arguments;
    if(message.params.name==="fetch"){
      respond(event.source,message.id,{content:[{type:"text",text:"Fetched"}],structuredContent:{id:fixture.theme.id,title:fixture.theme.name,text:fixture.theme.summary,url:"https://www.dexthemes.com",metadata:fixture.theme}});
      return;
    }
    const payload={kind:"theme-apply",theme:args.theme,variant:args.variant,settingsUrl:"codex://settings",importString:"codex-theme-v1:"+JSON.stringify({variant:args.variant,theme:{accent:args.theme[args.variant].accent}})};
    respond(event.source,message.id,{content:[{type:"text",text:"Prepared"}],structuredContent:payload});
    return;
  }
  if(message.method==="ui/open-link")respond(event.source,message.id,{});
});
</script></body></html>`;

const server = http.createServer((request, response) => {
  if (request.url === "/widget") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(THEME_PREVIEW_HTML);
    return;
  }
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(hostHtml);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  browser = await chromium.launch({ headless: true, executablePath }).catch(() => {
    throw error;
  });
}
const page = await browser.newPage({ viewport: { width: 1120, height: 1080 }, deviceScaleFactor: 1 });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: "networkidle" });
  const frame = page.frames().find((candidate) => candidate.url().endsWith("/widget"));
  if (!frame) throw new Error("Widget frame did not load");
  await frame.locator(".codex-mock").first().waitFor();
  await page.screenshot({ path: path.join(outputDir, "theme-preview.png"), fullPage: true });

  await frame.locator('[data-variant="light"]').click();
  await frame.getByRole("button", { name: "Use light in Codex" }).click();
  await frame.locator(".apply-handoff").waitFor();
  await frame.getByText("Choose Import theme and paste.").waitFor();
  await page.screenshot({ path: path.join(outputDir, "apply-handoff.png"), fullPage: true });

  await page.evaluate((payload) => window.sendFixture(payload), leaderboardFixture);
  await frame.locator(".rank-board").waitFor();
  await frame.getByText("Golden Hour").waitFor();
  await page.screenshot({ path: path.join(outputDir, "leaderboard.png"), fullPage: true });
  await frame.locator(".rank-row").first().click();
  await frame.getByRole("button", { name: "← Back" }).waitFor();

  await page.evaluate((payload) => window.sendFixture(payload), profileFixture);
  await frame.getByRole("heading", { name: "Popularity wins" }).waitFor();
  await frame.getByText("Theme of the Day").waitFor();
  await page.screenshot({ path: path.join(outputDir, "creator-dashboard.png"), fullPage: true });

  if (pageErrors.length) throw new Error(`Widget page errors: ${pageErrors.join(" | ")}`);
  console.log(JSON.stringify({
    preview: path.join(outputDir, "theme-preview.png"),
    apply: path.join(outputDir, "apply-handoff.png"),
    leaderboard: path.join(outputDir, "leaderboard.png"),
    dashboard: path.join(outputDir, "creator-dashboard.png"),
  }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
