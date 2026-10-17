import { collectPublicSignals } from "../server/providers.mjs";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const force = req.query?.force === "true" || req.query?.refresh === "true";
    const data = await collectPublicSignals(force);

    // Edge CDN caching: 3 minutes fresh on CDN, 10 minutes stale-while-revalidate
    res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Vercel /api/live error:", err);
    return res.status(503).json({ error: "Public providers could not be reached." });
  }
}
