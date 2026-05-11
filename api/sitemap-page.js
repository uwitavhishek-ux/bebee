export const config = { runtime: "edge", maxDuration: 15 };

export default async function handler(req) {
  const { pathname } = new URL(req.url);
  const host = new URL(req.url).host;
  const today = new Date().toISOString().split("T")[0];

  if (pathname.includes("sitemap-main")) {
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
      headers: { "content-type": "application/xml; charset=utf-8" },
    });
  }

  const pageMatch = pathname.match(/sitemap-jobs-(\d+)\.xml/);
  if (!pageMatch) return new Response("Not found", { status: 404 });

  const page = parseInt(pageMatch[1]);

  // Fetch bebee sitemap directly — skip the /api/jobs middleman
  const sitemapUrl = page === 1
    ? "https://bebee.com/sitemaps/jobs/us"
    : `https://bebee.com/sitemaps/jobs/us/${page}`;

  try {
    const res = await fetch(sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Accept": "*/*",
      },
      redirect: "follow",
    });

    // Get raw bytes
    const buffer = await res.arrayBuffer();

    // Try gzip first
    let xml = "";
    try {
      const ds = new DecompressionStream("gzip");
      const blob = new Blob([buffer]);
      const stream = blob.stream().pipeThrough(ds);
      xml = await new Response(stream).text();
    } catch(e1) {
      // Try raw text
      try {
        xml = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      } catch(e2) {
        xml = "";
      }
    }

    // Extract locs
    const locs     = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)].map(m => m[1]);
    const lastmods = [...xml.matchAll(/<lastmod>\s*(.*?)\s*<\/lastmod>/gi)].map(m => m[1]);

    const jobLocs = locs.filter(l => l.includes("/us/jobs/"));

    const out = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobLocs.map((loc, i) => {
  const path = loc.replace("https://bebee.com", "");
  return `  <url>
    <loc>https://${host}${path}</loc>
    <lastmod>${lastmods[i] || today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join("\n")}
</urlset>`;

    return new Response(out, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "s-maxage=3600, stale-while-revalidate=7200",
        "x-debug-status": String(res.status),
        "x-debug-locs": String(jobLocs.length),
        "x-debug-encoding": res.headers.get("content-encoding") || "none",
        "x-debug-type": res.headers.get("content-type") || "none",
      },
    });

  } catch(e) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- error: ${e.message} --></urlset>`,
      { headers: { "content-type": "application/xml; charset=utf-8" } }
    );
  }
}
