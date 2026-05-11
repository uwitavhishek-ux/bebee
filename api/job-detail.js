export const config = { runtime: "edge", maxDuration: 15 };

export default async function handler(req) {
  const { pathname } = new URL(req.url);
  const host = new URL(req.url).host;

  const bebeeUrl = `https://bebee.com${pathname}`;

  try {
    const res = await fetch(bebeeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const html = await res.text();

    // Extract exact JSON-LD JobPosting from bebee source
    let jobPosting = null;
    const scriptMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of scriptMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        if (parsed["@type"] === "JobPosting") { jobPosting = parsed; break; }
        if (parsed["@graph"]) {
          const found = parsed["@graph"].find(x => x["@type"] === "JobPosting");
          if (found) { jobPosting = found; break; }
        }
      } catch(e) {}
    }

    // Extract meta tags as fallback
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch  = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    const title        = jobPosting?.title || jobPosting?.name || titleMatch?.[1]?.replace(/ \| BeBee.*/, "") || "Job Posting";
    const company      = jobPosting?.hiringOrganization?.name || "BeBee";
    const description  = jobPosting?.description || descMatch?.[1] || "";
    const datePosted   = jobPosting?.datePosted || "";
    const validThrough = jobPosting?.validThrough || "";
    const empType      = Array.isArray(jobPosting?.employmentType)
      ? jobPosting.employmentType.join(", ")
      : (jobPosting?.employmentType || "");

    const addr    = jobPosting?.jobLocation?.address || jobPosting?.jobLocation?.[0]?.address || {};
    const location = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(", ") || "Remote · US";

    const salaryVal = jobPosting?.baseSalary?.value;
    const salary    = salaryVal
      ? `${jobPosting.baseSalary.currency || "USD"} ${salaryVal.minValue || salaryVal.value || ""}${salaryVal.maxValue ? "–" + salaryVal.maxValue : ""} / ${(salaryVal.unitText || "").toLowerCase()}`
      : "";

    const cleanDesc = description
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000);

    // Use exact schema from bebee — injected in <head> invisibly
    const schemaScript = jobPosting
      ? `<script type="application/ld+json">${JSON.stringify(jobPosting)}</script>`
      : "";

    const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title} — Unique Jobs</title>
<meta name="description" content="${cleanDesc.substring(0, 160)}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${cleanDesc.substring(0, 200)}"/>
<meta property="og:type" content="website"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
${schemaScript}
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--g:#00e676;--gm:#00c853;--gd:#007a33;--bg:#070d09;--bg2:#0c1510;--sur:#111d14;--bor:#1a2e1e;--tx:#e4f0e6;--mu:#5a8060}
body{background:var(--bg);color:var(--tx);font-family:"DM Sans",sans-serif;font-weight:300;min-height:100vh}
.hdr{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;padding:0 32px;display:flex;align-items:center;justify-content:space-between;background:rgba(7,13,9,.96);backdrop-filter:blur(14px);border-bottom:1px solid var(--bor)}
.hdr-logo{font-family:"Syne",sans-serif;font-weight:800;font-size:1.2rem;letter-spacing:-.
