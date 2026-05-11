export const config = { runtime: "edge" };

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Unique Jobs — US Remote Jobs</title>
<meta name="description" content="Thousands of US remote jobs updated daily. Find your next role."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --g: #00e676; --gm: #00c853; --gd: #007a33;
  --bg: #070d09; --bg2: #0c1510; --sur: #111d14;
  --bor: #1a2e1e; --tx: #e4f0e6; --mu: #5a8060;
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--tx); font-family: "DM Sans", sans-serif; font-weight: 300; }

/* ── HEADER ── */
.hdr {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 64px; padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(7,13,9,.96); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--bor);
}
.hdr-logo {
  font-family: "Syne", sans-serif; font-weight: 800; font-size: 1.25rem;
  letter-spacing: -.03em; color: #fff; text-decoration: none;
  display: flex; align-items: center; gap: 9px;
}
.hdr-dot {
  width: 8px; height: 8px; background: var(--g);
  border-radius: 50%; flex-shrink: 0;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
.hdr-right { display: flex; align-items: center; gap: 12px; }
.hdr-pill {
  font-size: .68rem; letter-spacing: .1em; text-transform: uppercase;
  color: var(--mu); border: 1px solid var(--bor);
  padding: 5px 14px; border-radius: 100px;
}
.hdr-count {
  font-family: "Syne", sans-serif; font-weight: 700; font-size: .72rem;
  color: var(--g); background: rgba(0,230,118,.1);
  border: 1px solid var(--gd); padding: 5px 14px; border-radius: 100px;
}

/* ── HERO ── */
.hero {
  padding: 112px 32px 52px; max-width: 1160px; margin: 0 auto;
  border-bottom: 1px solid var(--bor);
}
.hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--sur); border: 1px solid var(--bor);
  padding: 5px 16px; border-radius: 100px;
  font-size: .68rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--g); margin-bottom: 24px;
}
.hero-tag-dot { width: 5px; height: 5px; background: var(--g); border-radius: 50%; }
.hero h1 {
  font-family: "Syne", sans-serif; font-weight: 800;
  font-size: clamp(2.6rem, 6vw, 5rem);
  line-height: .96; letter-spacing: -.04em; color: #fff; margin-bottom: 18px;
}
.hero h1 em { font-style: normal; color: var(--g); }
.hero-sub { color: var(--mu); font-size: .95rem; line-height: 1.7; max-width: 440px; margin-bottom: 32px; }

/* ── SEARCH ── */
.search-bar {
  display: flex; gap: 8px; max-width: 600px; flex-wrap: wrap;
}
.search-bar input {
  flex: 1; min-width: 200px;
  background: var(--sur); border: 1px solid var(--bor);
  color: var(--tx); padding: 13px 18px; border-radius: 2px;
  font-size: .88rem; font-family: "DM Sans", sans-serif;
  outline: none; transition: border-color .2s;
}
.search-bar input::placeholder { color: var(--mu); }
.search-bar input:focus { border-color: var(--g); box-shadow: 0 0 0 2px rgba(0,230,118,.08); }
.search-bar button {
  background: var(--g); color: var(--bg); border: none;
  padding: 13px 26px; border-radius: 2px; cursor: pointer;
  font-family: "Syne", sans-serif; font-weight: 800;
  font-size: .75rem; letter-spacing: .06em; text-transform: uppercase;
  transition: all .2s; white-space: nowrap;
}
.search-bar button:hover { background: var(--gm); transform: translateY(-1px); }

/* ── LAYOUT ── */
.wrap { max-width: 1160px; margin: 0 auto; padding: 0 32px 80px; display: flex; gap: 28px; }

/* ── SIDEBAR ── */
.side {
  width: 220px; flex-shrink: 0; padding-top: 32px;
  position: sticky; top: 80px; height: fit-content;
}
.side-title {
  font-size: .62rem; letter-spacing: .18em; text-transform: uppercase;
  color: var(--g); margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.side-title::before { content: ''; width: 18px; height: 1px; background: var(--g); }
.side-btn {
  display: block; width: 100%; text-align: left;
  background: transparent; border: 1px solid var(--bor);
  color: var(--mu); padding: 8px 13px; border-radius: 2px;
  font-size: .76rem; cursor: pointer; transition: all .2s;
  margin-bottom: 5px; font-family: "DM Sans", sans-serif;
}
.side-btn:hover, .side-btn.on {
  background: var(--sur); border-color: var(--gd); color: var(--g);
}
.side-sep { height: 1px; background: var(--bor); margin: 16px 0; }
.page-label { font-size: .62rem; letter-spacing: .12em; text-transform: uppercase; color: var(--mu); margin-bottom: 10px; }
.pg-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 32px;
  background: var(--bg2); border: 1px solid var(--bor);
  color: var(--mu); border-radius: 2px; cursor: pointer;
  font-family: "Syne", sans-serif; font-weight: 700; font-size: .72rem;
  transition: all .2s; margin: 0 3px 5px 0;
}
.pg-btn:hover, .pg-btn.on { background: var(--g); color: var(--bg); border-color: var(--g); }

/* ── JOBS PANEL ── */
.jobs-panel { flex: 1; min-width: 0; padding-top: 32px; }
.jobs-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px; flex-wrap: wrap; gap: 10px;
}
.jobs-bar-info { font-size: .76rem; color: var(--mu); }
.jobs-bar-info b { color: var(--tx); font-weight: 500; }
.sort-sel {
  background: var(--sur); border: 1px solid var(--bor); color: var(--tx);
  padding: 7px 12px; border-radius: 2px; font-size: .76rem;
  font-family: "DM Sans", sans-serif; outline: none; cursor: pointer;
}
.sort-sel:focus { border-color: var(--g); }

/* ── JOB CARD ── */
.card {
  background: var(--bg2); border: 1px solid var(--bor);
  border-radius: 3px; padding: 18px 20px;
  display: flex; align-items: center; gap: 16px;
  transition: all .2s; cursor: pointer; position: relative;
  overflow: hidden; margin-bottom: 8px;
  animation: fadeUp .35s ease both;
}
.card::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--g); transform: scaleY(0);
  transition: transform .2s; transform-origin: bottom;
}
.card:hover { border-color: var(--gd); background: var(--sur); transform: translateX(3px); }
.card:hover::after { transform: scaleY(1); }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

.card-ico {
  width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
  background: var(--sur); border: 1px solid var(--bor);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.card-body { flex: 1; min-width: 0; }
.card-title {
  font-family: "Syne", sans-serif; font-weight: 700; font-size: .9rem;
  color: #fff; margin-bottom: 5px; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-meta { display: flex; gap: 14px; flex-wrap: wrap; }
.card-meta span {
  font-size: .69rem; color: var(--mu);
  display: flex; align-items: center; gap: 4px;
}
.card-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.badge {
  padding: 3px 10px; border-radius: 100px;
  font-size: .6rem; letter-spacing: .08em; text-transform: uppercase;
  border: 1px solid var(--bor); color: var(--mu); background: var(--sur);
}
.badge.new { border-color: var(--gd); color: var(--g); background: rgba(0,230,118,.07); }
.card-apply {
  background: transparent; border: 1px solid var(--gd); color: var(--g);
  padding: 7px 16px; border-radius: 2px;
  font-family: "Syne", sans-serif; font-weight: 700; font-size: .68rem;
  letter-spacing: .06em; text-transform: uppercase;
  cursor: pointer; transition: all .2s; white-space: nowrap; text-decoration: none;
}
.card-apply:hover { background: var(--g); color: var(--bg); }

/* ── STATES ── */
.loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 20px; gap: 14px;
}
.spin {
  width: 34px; height: 34px; border: 2px solid var(--bor);
  border-top-color: var(--g); border-radius: 50%;
  animation: spin .75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.spin-txt { color: var(--mu); font-size: .82rem; }
.empty { text-align: center; padding: 60px 20px; color: var(--mu); }
.empty-ico { font-size: 2.2rem; margin-bottom: 12px; opacity: .3; }
.err { text-align: center; padding: 40px; color: #e57373; font-size: .85rem; }

/* ── MARQUEE ── */
.marq {
  overflow: hidden; border-top: 1px solid var(--bor);
  border-bottom: 1px solid var(--bor); padding: 14px 0;
  background: var(--bg2);
}
.marq-track {
  display: flex; width: max-content;
  animation: marq 30s linear infinite;
}
.marq-item {
  padding: 0 36px; font-size: .68rem; letter-spacing: .14em;
  text-transform: uppercase; color: var(--mu); white-space: nowrap;
  display: flex; align-items: center; gap: 18px;
}
.marq-item::after { content: "✦"; color: var(--g); font-size: .55rem; }
@keyframes marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ── RESPONSIVE ── */
@media(max-width:860px){ .side{display:none;} }
@media(max-width:600px){
  .hdr{padding:0 18px;}
  .hero{padding:96px 18px 40px;}
  .wrap{padding:0 18px 60px;}
  .card{flex-wrap:wrap;}
  .card-right{width:100%;}
  .card-apply{width:100%;text-align:center;}
}
</style>
</head>
<body>

<!-- HEADER -->
<header class="hdr">
  <a href="/" class="hdr-logo">
    <span class="hdr-dot"></span>Unique Jobs
  </a>
  <div class="hdr-right">
    <span class="hdr-pill">🇺🇸 US Remote</span>
    <span class="hdr-count" id="hdrCount">Loading...</span>
  </div>
</header>

<!-- HERO -->
<div class="hero">
  <div class="hero-tag"><span class="hero-tag-dot"></span>Live from BeBee Sitemap</div>
  <h1>Find your next<br/><em>remote job.</em></h1>
  <p class="hero-sub">Real US remote jobs pulled directly from BeBee's sitemap. Updated every 30 minutes. No noise.</p>
  <div class="search-bar">
    <input id="q" type="text" placeholder="Title, skill, or company…" />
    <button onclick="search()">Search</button>
  </div>
</div>

<!-- MARQUEE -->
<div class="marq">
  <div class="marq-track" id="marqTrack">
    <span class="marq-item">Engineering</span><span class="marq-item">Design</span>
    <span class="marq-item">Marketing</span><span class="marq-item">Product</span>
    <span class="marq-item">Finance</span><span class="marq-item">Sales</span>
    <span class="marq-item">Data & AI</span><span class="marq-item">DevOps</span>
    <span class="marq-item">Healthcare</span><span class="marq-item">Legal</span>
    <span class="marq-item">Customer Success</span><span class="marq-item">Operations</span>
    <span class="marq-item">Engineering</span><span class="marq-item">Design</span>
    <span class="marq-item">Marketing</span><span class="marq-item">Product</span>
    <span class="marq-item">Finance</span><span class="marq-item">Sales</span>
    <span class="marq-item">Data & AI</span><span class="marq-item">DevOps</span>
    <span class="marq-item">Healthcare</span><span class="marq-item">Legal</span>
    <span class="marq-item">Customer Success</span><span class="marq-item">Operations</span>
  </div>
</div>

<!-- MAIN -->
<div class="wrap">

  <!-- SIDEBAR -->
  <aside class="side">
    <div class="side-title">Categories</div>
    <button class="side-btn on" onclick="cat(this,'')">All Jobs</button>
    <button class="side-btn" onclick="cat(this,'engineer')">Engineering</button>
    <button class="side-btn" onclick="cat(this,'developer')">Developer</button>
    <button class="side-btn" onclick="cat(this,'designer')">Design</button>
    <button class="side-btn" onclick="cat(this,'marketing')">Marketing</button>
    <button class="side-btn" onclick="cat(this,'product')">Product</button>
    <button class="side-btn" onclick="cat(this,'manager')">Management</button>
    <button class="side-btn" onclick="cat(this,'sales')">Sales</button>
    <button class="side-btn" onclick="cat(this,'data')">Data & AI</button>
    <button class="side-btn" onclick="cat(this,'finance')">Finance</button>
    <button class="side-btn" onclick="cat(this,'customer')">Customer Success</button>
    <button class="side-btn" onclick="cat(this,'nurse')">Healthcare</button>
    <button class="side-btn" onclick="cat(this,'devops')">DevOps</button>
    <div class="side-sep"></div>
    <div class="page-label">Sitemap Page</div>
    <div id="pgBtns"></div>
  </aside>

  <!-- JOBS -->
  <div class="jobs-panel">
    <div class="jobs-bar">
      <div class="jobs-bar-info" id="barInfo">Loading jobs…</div>
      <select class="sort-sel" id="sortSel" onchange="sortJobs(this.value)">
        <option value="date">Newest First</option>
        <option value="alpha">A → Z</option>
      </select>
    </div>
    <div id="grid">
      <div class="loading"><div class="spin"></div><div class="spin-txt">Fetching latest US jobs…</div></div>
    </div>
  </div>
</div>

<script>
// ── STATE ──
let curPage = 1, curQ = "", curCat = "", jobs = [], sortMode = "date";
const ICONS = ["💼","🚀","💡","🎯","⚡","🔧","📊","🌐","🎨","🔬","📱","🏗️"];

// ── INIT ──
buildPageBtns();
load(1, "");

document.getElementById("q").addEventListener("keydown", e => { if(e.key==="Enter") search(); });

function buildPageBtns() {
  const el = document.getElementById("pgBtns");
  el.innerHTML = Array.from({length:10},(_,i)=>
    '<button class="pg-btn'+(i===0?' on':'')+'" id="pg'+(i+1)+'" onclick="goPage('+(i+1)+')">'+(i+1)+'</button>'
  ).join("");
}

function search() {
  curQ = document.getElementById("q").value.trim();
  curCat = "";
  document.querySelectorAll(".side-btn").forEach(b => b.classList.remove("on"));
  document.querySelector(".side-btn").classList.add("on");
  load(curPage, curQ);
}

function cat(btn, term) {
  document.querySelectorAll(".side-btn").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  curCat = term;
  curQ = term;
  document.getElementById("q").value = term;
  load(curPage, term);
}

function goPage(p) {
  curPage = p;
  document.querySelectorAll(".pg-btn").forEach((b,i) => b.classList.toggle("on", i+1===p));
  load(p, curQ);
  window.scrollTo({top:0,behavior:"smooth"});
}

function sortJobs(mode) {
  sortMode = mode;
  render(jobs);
}

async function load(page, q) {
  const grid = document.getElementById("grid");
  grid.innerHTML = '<div class="loading"><div class="spin"></div><div class="spin-txt">Fetching page '+page+'…</div></div>';

  try {
    const r = await fetch("/api/jobs?page="+page+"&q="+encodeURIComponent(q));
    const d = await r.json();

    if (d.error) throw new Error(d.error);

    jobs = d.jobs || [];
    document.getElementById("hdrCount").textContent = jobs.length + " jobs";
    document.getElementById("barInfo").innerHTML =
      "<b>"+jobs.length+" jobs</b>" + (q ? " matching <em>\""+esc(q)+"\"</em>" : " on page "+page);

    render(jobs);
  } catch(e) {
    grid.innerHTML = '<div class="err">⚠ Could not load jobs: '+esc(e.message)+'<br/><small>BeBee sitemap may be temporarily unavailable.</small></div>';
    document.getElementById("hdrCount").textContent = "Error";
  }
}

function render(list) {
  const grid = document.getElementById("grid");

  // Sort
  const sorted = [...list].sort((a,b) => {
    if (sortMode === "alpha") return a.title.localeCompare(b.title);
    return (b.lastmod||"").localeCompare(a.lastmod||"");
  });

  if (!sorted.length) {
    grid.innerHTML = '<div class="empty"><div class="empty-ico">🔍</div>No jobs found.<br/>Try another category or page.</div>';
    return;
  }

  const now = Date.now();
  grid.innerHTML = sorted.map((job, i) => {
    const isNew = job.lastmod && (now - new Date(job.lastmod).getTime()) < 7*86400000;
    const icon  = ICONS[i % ICONS.length];
    const date  = job.lastmod ? new Date(job.lastmod).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "Recent";
    const delay = Math.min(i*25, 400);

    return \`<div class="card" style="animation-delay:\${delay}ms">
      <div class="card-ico">\${icon}</div>
      <div class="card-body">
        <div class="card-title">\${esc(job.title)}</div>
        <div class="card-meta">
          <span>🏢 \${esc(job.company)}</span>
          <span>📍 Remote · US</span>
          <span>🕐 \${date}</span>
        </div>
      </div>
      <div class="card-right">
        <span class="badge \${isNew?"new":""}"> \${isNew?"New":"Remote"}</span>
        <a class="card-apply" href="\${esc(job.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Apply →</a>
      </div>
    </div>\`;
  }).join("");
}

function esc(s){
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
</script>
</body>
</html>`;

export default async function handler(req) {
  return new Response(PAGE, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
