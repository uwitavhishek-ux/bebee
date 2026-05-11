export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const q    = (searchParams.get("q") || "").toLowerCase().trim();

  const sitemapUrl = page === 1
    ? "https://bebee.com/sitemaps/jobs/us"
    : `https://bebee.com/sitemaps/jobs/us/${page}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "application/xml, text/xml, */*",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error("Sitemap fetch failed: " + res.status);

    // Read as buffer and decompress gzip
    const buffer = await res.arrayBuffer();
    let xml = "";

    try {
      const ds = new DecompressionStream("gzip");
      const stream = new Response(buffer).body.pipeThrough(ds);
      const decompressed = await new Response(stream).arrayBuffer();
      xml = new TextDecoder().decode(decompressed);
    } catch(e) {
      // fallback: try raw decode
      xml = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    }

    // If still no <loc> tags, try deflate
    if (!xml.includes("<loc>")) {
      try {
        const ds2 = new DecompressionStream("deflate");
        const stream2 = new Response(buffer).body.pipeThrough(ds2);
        const decompressed2 = await new Response(stream2).arrayBuffer();
        xml = new TextDecoder().decode(decompressed2);
      } catch(e) {}
    }

    const jobs = [];
    const blocks = xml.split(/<url>/i).slice(1);

    for (const block of blocks) {
      const loc     = (block.match(/<loc>([\s\S]*?)<\/loc>/i) || [])[1]?.trim();
      const lastmod = (block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i) || [])[1]?.trim() || "";
      if (!loc || !loc.includes("/us/jobs/")) continue;

      const slug  = loc.split("/us/jobs/")[1] || "";
      const parts = slug.split("--");
      const raw   = parts[0] || "";

      const title = raw
        .replace(/-\d+$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();

      const src = parts[1] || "";
      const company = src
        .replace(/-[\da-f]{8,}.*$/, "")
        .replace(/-\d+$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim() || "BeBee";

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
    return new Response(
      JSON.stringify({ error: err.message, jobs: [], page, total: 0 }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
