export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const token = String(process.env.OPENAI_APPS_CHALLENGE || "").trim();
  if (!token || token.length > 512 || /[\r\n]/.test(token)) {
    return res.status(404).send("Not found");
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).send(token);
}
