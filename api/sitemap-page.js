export const config = { runtime: "edge", maxDuration: 15 };

export default async function handler(req) {
  const { pathname } = new URL(req.url);
  const host = new URL(req.url).host;
  const today = new Date().toISOString().split("T")[0];

  // Extract page number from URL e.g. /sitemap-jobs-3.xml → 3
  // Also handle /sitemap-main.xml
  const mainMatch = pathname.includes("sitemap-main");
  const pageMatch = pathname.match(/sitemap-jobs-(\d+)\.xml/);

  if (mainMatch) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${host}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(xml, {
      headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "s-maxage=86400" },
    });
  }

  if (!pageMatch) {
    return new Response("Not found", { status: 404 });
  }

  const page = parseInt(pageMatch[1]);
  const sitemapUrl = page === 1
    ? "https://bebee.com/sitemaps/jobs/us"
    : `https://bebee.com/sitemaps/jobs/us/${page}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(sitemapUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error("Failed: " + res.status);

    const xml = await res.text();
    const locs    = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m => m[1].trim());
    const lastmods = [...xml.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/gi)].map(m => m[1].trim());

    const urls = locs
      .filter(loc => loc.includes("/us/jobs/"))
      .map((loc, i) => ({
        loc: `https://${host}${loc.replace("https://bebee.com", "")}`,
        lastmod: lastmods[i] || today,
      }));

    const out = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>`;

    return new Response(out, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "s-maxage=3600, stale-while-revalidate=7200",
      },
    });

  } catch(e) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { "content-type": "application/xml; charset=utf-8" },
    });
  }
}
