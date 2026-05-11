export const config = { 
  runtime: "edge",
  maxDuration: 30,
};

export default async function handler(req) {
  const host = new URL(req.url).host;
  const today = new Date().toISOString().split("T")[0];

  // Fetch all 10 pages IN PARALLEL with a 5s timeout each
  const pages = Array.from({ length: 10 }, (_, i) => i + 1);

  const results = await Promise.allSettled(
    pages.map(async (page) => {
      const url = page === 1
        ? "https://bebee.com/sitemaps/jobs/us"
        : `https://bebee.com/sitemaps/jobs/us/${page}`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
          redirect: "follow",
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) return [];

        const xml = await res.text();
        const locs    = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
        const lastmods = [...xml.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/gi)].map(m => m[1].trim());

        return locs
          .filter(loc => loc.includes("/us/jobs/"))
          .map((loc, i) => ({
            loc: `https://${host}${loc.replace("https://bebee.com", "")}`,
            lastmod: lastmods[i] || today,
          }));
      } catch(e) {
        clearTimeout(timer);
        return [];
      }
    })
  );

  const allUrls = results.flatMap(r => r.status === "fulfilled" ? r.value : []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${host}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
