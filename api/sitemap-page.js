export const config = { runtime: "edge", maxDuration: 15 };

export default async function handler(req) {
  const { pathname } = new URL(req.url);
  const host = new URL(req.url).host;
  const today = new Date().toISOString().split("T")[0];

  // /sitemap-main.xml
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
      headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "s-maxage=86400" },
    });
  }

  // /sitemap-jobs-N.xml
  const pageMatch = pathname.match(/sitemap-jobs-(\d+)\.xml/);
  if (!pageMatch) return new Response("Not found", { status: 404 });

  const page = parseInt(pageMatch[1]);

  try {
    // ✅ Fetch jobs from our own API endpoint
    const apiUrl = `https://${host}/api/jobs?page=${page}`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error("API fetch failed: " + res.status);

    const data = await res.json();
    const jobs = data.jobs || [];

    const out = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobs.map(job => {
  // Rewrite bebee.com URL to our domain
  const path = job.url.replace("https://bebee.com", "");
  const loc  = `https://${host}${path}`;
  const lastmod = job.lastmod || today;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join("\n")}
</urlset>`;

    return new Response(out, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "s-maxage=3600, stale-while-revalidate=7200",
      },
    });

  } catch(e) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- error: ${e.message} --></urlset>`,
      { headers: { "content-type": "application/xml; charset=utf-8" } }
    );
  }
}
