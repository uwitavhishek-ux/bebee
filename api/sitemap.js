export const config = { runtime: "edge" };

export default async function handler(req) {
  const host = new URL(req.url).host;
  const allUrls = [];

  for (let page = 1; page <= 10; page++) {
    try {
      const sitemapUrl = page === 1
        ? "https://bebee.com/sitemaps/jobs/us"
        : `https://bebee.com/sitemaps/jobs/us/${page}`;

      const res = await fetch(sitemapUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
        redirect: "follow",
      });

      if (!res.ok) continue;

      const xml = await res.text();

      const locs    = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
      const lastmods = [...xml.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/gi)].map(m => m[1].trim());

      locs.forEach((loc, i) => {
        if (!loc.includes("/us/jobs/")) return;
        const path = loc.replace("https://bebee.com", "");
        allUrls.push({
          loc: `https://${host}${path}`,
          lastmod: lastmods[i] || new Date().toISOString().split("T")[0],
        });
      });

    } catch(e) {}
  }

  const today = new Date().toISOString().split("T")[0];

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
