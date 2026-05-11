export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const q    = (searchParams.get("q") || "").toLowerCase().trim();

  const sitemapUrl = page === 1
    ? "https://bebee.com/sitemaps/jobs/us"
    : `https://bebee.com/sitemaps/jobs/us/${page}`;

  try {
    const res = await fetch(sitemapUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      redirect: "follow",
    });

    if (!res.ok) throw new Error("Sitemap fetch failed: " + res.status);

    const xml = await res.text();
    const jobs = [];

    // Parse every <url> block
    const blocks = xml.split(/<url>/i).slice(1);
    for (const block of blocks) {
      const loc      = (block.match(/<loc>([\s\S]*?)<\/loc>/i) || [])[1]?.trim();
      const lastmod  = (block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i) || [])[1]?.trim() || "";
      if (!loc || !loc.includes("/us/jobs/")) continue;

      // Slug → title + company
      const slug   = loc.split("/us/jobs/")[1] || "";
      const parts  = slug.split("--");
      const raw    = parts[0] || "";

      // Remove trailing source ID numbers from title part
      const title  = raw
        .replace(/-\d+$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();

      // Company from second segment before numeric ID
      const src    = parts[1] || "";
      const company = src
        .replace(/-[\da-f]{8,}.*$/, "")   // remove hash IDs
        .replace(/-\d+$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim() || "BeBee";

      // Search filter
      if (q && !title.toLowerCase().includes(q) && !company.toLowerCase().includes(q)) continue;

      jobs.push({ url: loc, title, company, lastmod });
    }

    return new Response(JSON.stringify({ jobs, page, total: jobs.length }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "s-maxage=1800, stale-while-revalidate=3600",
        "access-control-allow-origin": "*",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, jobs: [], page, total: 0 }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
