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

    const addr     = jobPosting?.jobLocation?.address || jobPosting?.jobLocation?.[0]?.address || {};
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

    // Exact schema from bebee injected invisibly in <head>
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
.hdr-logo{font-family:"Syne",sans-serif;font-weight:800;font-size:1.2rem;letter-spacing:-.03em;color:#fff;text-decoration:none;display:flex;align-items:center;gap:9px}
.hdr-dot{width:7px;height:7px;background:var(--g);border-radius:50%;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
.hdr-back{font-size:.75rem;color:var(--mu);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color .2s}
.hdr-back:hover{color:var(--g)}
.wrap{max-width:860px;margin:0 auto;padding:96px 32px 80px}
.breadcrumb{font-size:.72rem;color:var(--mu);margin-bottom:28px;display:flex;align-items:center;gap:8px}
.breadcrumb a{color:var(--mu);text-decoration:none;transition:color .2s}
.breadcrumb a:hover{color:var(--g)}
.breadcrumb span{opacity:.4}
.job-title{font-family:"Syne",sans-serif;font-weight:800;font-size:clamp(1.6rem,4vw,2.4rem);letter-spacing:-.03em;color:#fff;line-height:1.15;margin-bottom:16px}
.job-company{font-size:1rem;color:var(--g);font-weight:500;margin-bottom:18px}
.tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
.tag{padding:5px 14px;border-radius:100px;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--bor);color:var(--mu);background:var(--sur)}
.tag.hl{border-color:var(--gd);color:var(--g);background:rgba(0,230,118,.07)}
.apply-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:20px 24px;background:var(--bg2);border:1px solid var(--bor);border-radius:3px;margin-bottom:36px}
.apply-btn{background:var(--g);color:var(--bg);border:none;padding:13px 28px;border-radius:2px;font-family:"Syne",sans-serif;font-weight:800;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;text-decoration:none;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
.apply-btn:hover{background:var(--gm);transform:translateY(-1px)}
.apply-note{font-size:.75rem;color:var(--mu);line-height:1.5}
.section{background:var(--bg2);border:1px solid var(--bor);border-radius:3px;padding:28px;margin-bottom:16px}
.section-title{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--g);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-title::before{content:"";width:16px;height:1px;background:var(--g)}
.desc{font-size:.9rem;line-height:1.85;color:var(--tx)}
footer{border-top:1px solid var(--bor);padding:32px;text-align:center;color:var(--mu);font-size:.75rem;margin-top:40px}
footer a{color:var(--mu);text-decoration:none}
footer a:hover{color:var(--g)}
@media(max-width:600px){.hdr,.wrap,footer{padding-left:18px;padding-right:18px}.apply-bar{flex-direction:column;align-items:flex-start}.apply-btn{width:100%;text-align:center;justify-content:center}}
</style>
</head>
<body>
<header class="hdr">
  <a href="/" class="hdr-logo"><span class="hdr-dot"></span>Unique Jobs</a>
  <a href="/" class="hdr-back">← Back to jobs</a>
</header>

<div class="wrap">
  <div class="breadcrumb">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/">Jobs</a>
    <span>/</span>
    <span>${title.substring(0, 60)}</span>
  </div>

  <h1 class="job-title">${title}</h1>
  <div class="job-company">${company}</div>

  <div class="tags">
    ${empType ? `<span class="tag hl">${empType}</span>` : ""}
    <span class="tag hl">Remote · US</span>
    ${location !== "Remote · US" ? `<span class="tag">${location}</span>` : ""}
    ${salary ? `<span class="tag hl">${salary}</span>` : ""}
    ${datePosted ? `<span class="tag">Posted: ${datePosted}</span>` : ""}
    ${validThrough ? `<span class="tag">Until: ${validThrough}</span>` : ""}
  </div>

  <div class="apply-bar">
    <a class="apply-btn" href="${bebeeUrl}" target="_blank" rel="noopener">Apply Now →</a>
    <div class="apply-note">
      You will be redirected to the original job posting on BeBee.<br/>
      Apply directly with the employer.
    </div>
  </div>

  ${cleanDesc ? `
  <div class="section">
    <div class="section-title">Job Description</div>
    <div class="desc">${cleanDesc.replace(/\n/g, "<br/>")}</div>
  </div>` : ""}
</div>

<footer>
  <a href="/">Unique Jobs</a> &bull; US Remote Jobs &bull; &copy; 2026
</footer>
</body>
</html>`;

    return new Response(page, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });

  } catch(e) {
    return new Response(`<!DOCTYPE html><html><body style="background:#070d09;color:#e4f0e6;font-family:sans-serif;padding:40px">
      <h1 style="color:#00e676">Error loading job</h1>
      <p>${e.message}</p>
      <a href="/" style="color:#00e676">← Back to jobs</a>
    </body></html>`, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}
