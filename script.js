/* ---------------- progress bar ---------------- */
const progress = document.getElementById("progress");
function updateProgress(){
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progress.style.transform = `scaleX(${scrolled})`;
}
document.addEventListener("scroll", updateProgress, { passive:true });
updateProgress();

/* ---------------- scenes reveal + rail ---------------- */
const scenes = [...document.querySelectorAll(".scene.step")];
const dots = [...document.querySelectorAll(".rail .dot")];

function setActiveDot(id){
  dots.forEach(d => d.classList.toggle("active", d.dataset.target === id));
}

const sceneObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("reveal");
      setActiveDot(entry.target.id);
      triggerCounters(entry.target);
      triggerGrowth(entry.target);
    }
  });
}, { threshold: 0.55 });

scenes.forEach(s => sceneObserver.observe(s));

dots.forEach(dot=>{
  dot.addEventListener("click", ()=>{
    document.getElementById(dot.dataset.target)
      .scrollIntoView({ behavior:"smooth", block:"center" });
  });
});

/* ---------------- counters ---------------- */
const eased = t => 1 - Math.pow(1-t, 3);
const counted = new WeakSet();

function triggerCounters(container){
  const nums = container.querySelectorAll(".count");
  nums.forEach(n=>{
    if(counted.has(n)) return;
    counted.add(n);

    const from = Number(n.dataset.from || 0);
    const to   = Number(n.dataset.to   || 0);
    const dur  = 1200 + Math.min(2000, to/80);
    const start = performance.now();

    function step(now){
      const p = Math.min(1, (now - start)/dur);
      const val = Math.round(from + (to-from)*eased(p));
      n.textContent = val.toLocaleString("no-NO");
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// hero counters once
const heroObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      triggerCounters(document);
      heroObs.disconnect();
    }
  });
}, { threshold:0.6 });
heroObs.observe(document.querySelector("#hero"));

/* ---------------- growth bars ---------------- */
const grown = new WeakSet();
function triggerGrowth(container){
  const growths = container.querySelectorAll(".growth");
  growths.forEach(g=>{
    if(grown.has(g)) return;
    grown.add(g);

    const pct = Number(g.dataset.growth || 60);
    const bar = g.querySelector(".bar > span");
    requestAnimationFrame(()=> bar.style.width = pct + "%");
  });
}

/* ---------------- FLY-BY SKINS (rene PNG uten noe som henger etter) ---------------- */
const skinsLayer = document.getElementById("skinsLayer");

const skinDefs = [
  { label: "AK Redline",     size:1.0,  img:"assets/skins/redline.png" },
  { label: "Howl",           size:1.1,  img:"assets/skins/howl.png" },
  { label: "Medusa",         size:2.0,  img:"assets/skins/medusa.png" },
  { label: "Blue Gem",       size:1.15, img:"assets/skins/bluegem.png" },
  { label: "Wild Lotus",     size:1.0,  img:"assets/skins/wildlotus.png" },
  { label: "Crimson Kimono", size:1.05, img:"assets/skins/kimono.png" },
  { label: "Knife",          size:0.95, img:"assets/skins/knife.png" },
  { label: "Case",           size:0.9,  img:"assets/skins/case.png" }
];

const startSpots = [
  {x: 0.08, y: 0.20}, {x: 0.72, y: 0.12},
  {x: 0.15, y: 0.62}, {x: 0.78, y: 0.55},
  {x: 0.35, y: 0.30}, {x: 0.55, y: 0.72},
  {x: 0.22, y: 0.42}, {x: 0.88, y: 0.32}
];

const skins = [];
const rand = (a,b)=>a+Math.random()*(b-a);

function createSkins(){
  const W = innerWidth, H = innerHeight;

  skinDefs.forEach((d,i)=>{
    const el = document.createElement("div");
    el.className = "skin";

    // ✅ KUN IMG. Ingen caption, ingen tekst, ingenting ekstra.
    el.innerHTML = `<img src="${d.img}" alt="${d.label}">`;
    skinsLayer.appendChild(el);

    const w = 190*d.size, h = 120*d.size;
    el.style.width = w+"px";
    el.style.height = h+"px";

    const spot = startSpots[i % startSpots.length];

    skins.push({
      el,
      x: spot.x * (W - w),
      y: spot.y * (H - h),
      vx: rand(0.3, 0.7) * (Math.random() < 0.5 ? 1 : -1),
      vy: rand(-0.05, 0.05),
      r: rand(-8, 8),
      vr: rand(-0.08, 0.08),
      w, h,
      drift: rand(0, 9999)
    });
  });
}
createSkins();

function animateSkins(){
  const W = innerWidth, H = innerHeight;

  skins.forEach((s,i)=>{
    s.x += s.vx;
    s.y += s.vy + Math.sin((performance.now()/1500) + s.drift) * 0.04;
    s.r += s.vr;

    // respawn når de flyr ut
    if(s.x > W + 80) s.x = -s.w - 60;
    if(s.x < -s.w - 80) s.x = W + 60;

    if(s.y > H + 80) s.y = -s.h - 40;
    if(s.y < -s.h - 80) s.y = H + 40;

    s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.r}deg)`;
  });

  requestAnimationFrame(animateSkins);
}
animateSkins();

window.addEventListener("resize", ()=>{
  const W = innerWidth, H = innerHeight;
  skins.forEach((s,i)=>{
    const spot = startSpots[i % startSpots.length];
    s.x = spot.x * (W - s.w);
    s.y = spot.y * (H - s.h);
  });
});
/* ===== HEADER INTERAKSJON ===== */

// 1) Rotating / typewriter tekst
const rotatorLines = [
  "2015: bare et spill – ingen plan.",
  "Første arbitrage med AK Redline.",
  "Howl og Medusa ble vendepunktet.",
  "Trading finansierte studietiden.",
  "CS2 gjorde markedet farligere."
];
const rotatingTextEl = document.getElementById("rotatingText");
let rotatorIndex = 0;

function typeLine(line, i=0){
  rotatingTextEl.textContent = line.slice(0, i);
  if(i < line.length){
    setTimeout(()=>typeLine(line, i+1), 24);
  }else{
    setTimeout(()=>eraseLine(line), 1200);
  }
}
function eraseLine(line, i=line.length){
  rotatingTextEl.textContent = line.slice(0, i);
  if(i > 0){
    setTimeout(()=>eraseLine(line, i-1), 14);
  }else{
    rotatorIndex = (rotatorIndex + 1) % rotatorLines.length;
    typeLine(rotatorLines[rotatorIndex]);
  }
}
typeLine(rotatorLines[0]);

// 2) Start-knapp
const startBtn = document.getElementById("startStoryBtn");
startBtn?.addEventListener("click", ()=>{
  document.getElementById("s1")?.scrollIntoView({behavior:"smooth", block:"center"});
});

// 3) Tilt på hero-card
const heroCard = document.getElementById("heroCard");
function tilt(e){
  const rect = heroCard.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const dx = (e.clientX - cx) / rect.width;
  const dy = (e.clientY - cy) / rect.height;
  heroCard.style.transform = `
    rotateX(${(-dy*8).toFixed(2)}deg)
    rotateY(${(dx*10).toFixed(2)}deg)
    translateZ(0)
  `;
  heroCard.style.boxShadow = `0 30px 80px rgba(0,0,0,.55)`;
}
function untilt(){
  heroCard.style.transform = "";
  heroCard.style.boxShadow = "";
}
heroCard?.addEventListener("mousemove", tilt);
heroCard?.addEventListener("mouseleave", untilt);

// 4) “Markedstemning” meter som følger scroll (kun visual, ikke flytting av skins)
const moodBar = document.getElementById("moodBar");
const moodHint = document.getElementById("moodHint");

function updateMood(){
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  const pct = Math.max(0, Math.min(1, scrolled));
  if(moodBar) moodBar.style.width = (pct*100).toFixed(0) + "%";

  if(!moodHint) return;
  if(pct < .15) moodHint.textContent = "Rolig oppstart";
  else if(pct < .35) moodHint.textContent = "Første mønstre";
  else if(pct < .55) moodHint.textContent = "Bygger system";
  else if(pct < .75) moodHint.textContent = "Volatil vekst";
  else moodHint.textContent = "CS2-kaos";
}
document.addEventListener("scroll", updateMood, {passive:true});
updateMood();

// 5) Pause/Resume skins animasjon
const toggleMotionBtn = document.getElementById("toggleMotionBtn");
let skinsPaused = false;

// Du må ha en global flagg i skins-anim din:
window.__SKINS_PAUSED__ = false;

toggleMotionBtn?.addEventListener("click", ()=>{
  skinsPaused = !skinsPaused;
  window.__SKINS_PAUSED__ = skinsPaused;

  toggleMotionBtn.setAttribute("aria-pressed", String(skinsPaused));
  toggleMotionBtn.textContent = skinsPaused ? "Start bakgrunn" : "Pause bakgrunn";
  heroCard?.classList.toggle("is-paused", skinsPaused);
});

/* ===== Chapter 2: reveal steps one-by-one ===== */
const s2 = document.querySelector('#s2 [data-anim="market"]');
if (s2) {
  const steps = [...s2.querySelectorAll(".arb-step")];
  const result = s2.querySelector(".market-result");

  const s2Obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;

      // step reveal i rekkefølge
      steps.forEach((st, i)=>{
        setTimeout(()=> st.classList.add("is-on"), 350 + i*520);
      });

      // result til slutt
      setTimeout(()=> result?.classList.add("is-on"), 350 + steps.length*520);

      s2Obs.disconnect();
    });
  }, { threshold: 0.6 });

  s2Obs.observe(s2);
}

/* ===== Kapittel 2 v2: fortellende marked-scene ===== */
const s2v2 = document.querySelector('#s2 [data-anim="market2"]');

if(s2v2){
  const tradeSkin = document.getElementById("tradeSkin2");
  const richCard  = document.getElementById("richCard2");
  const poorCard  = document.getElementById("poorCard2");
  const logEl     = document.getElementById("miniLog");
  const steps     = [...s2v2.querySelectorAll(".arb-step")];
  const result    = s2v2.querySelector(".result2");
  const flipEl    = document.getElementById("flipCount2");
  const profEl    = document.getElementById("profitCount2");

  let active = false;
  let flips = 0;
  let prof  = 0;
  let loopT = null;
  let logT  = null;

  const logItems = [
    {side:"buy",  text:"Kjøp Redline", price:"1 key"},
    {side:"sell", text:"Selg Redline", price:"2 keys"},
    {side:"buy",  text:"Lav float",    price:"1.1 keys"},
    {side:"sell", text:"Rask buyer",   price:"2.0 keys"}
  ];

  function pushLog(){
    if(!active) return;
    const it = logItems[Math.floor(Math.random()*logItems.length)];
    const row = document.createElement("div");
    row.className = `log-row ${it.side}`;
    row.innerHTML = `<span>${it.text}</span><span class="muted">${it.price}</span>`;
    logEl.prepend(row);
    if(logEl.children.length > 3) logEl.removeChild(logEl.lastChild);
    logT = setTimeout(pushLog, 700 + Math.random()*600);
  }

  function tradeLoop(){
    if(!active) return;

    // start ved billig side (rich)
    tradeSkin.style.transition = "none";
    tradeSkin.style.opacity = "0";
    tradeSkin.style.transform = "translate(-50%,-50%) translateX(-60px) scale(0.9)";
    richCard.classList.add("pulse-buy");

    requestAnimationFrame(()=>{
      tradeSkin.style.transition = "transform 1.25s ease, opacity .35s ease";
      tradeSkin.style.opacity = "1";
      tradeSkin.style.transform = "translate(-50%,-50%) translateX(60px) scale(1.0)";
    });

    // når den når dyr side (poor) -> profit
    setTimeout(()=>{
      richCard.classList.remove("pulse-buy");
      poorCard.classList.add("pulse-sell");

      flips++;
      prof += 1;
      flipEl.textContent = flips;
      profEl.textContent = prof;
    }, 1250);

    setTimeout(()=>{
      tradeSkin.style.opacity = "0";
      poorCard.classList.remove("pulse-sell");
      loopT = setTimeout(tradeLoop, 900 + Math.random()*900);
    }, 2000);
  }

  function startS2(){
    if(active) return;
    active = true;

    // reveal steg én og én
    steps.forEach((st, i)=>{
      setTimeout(()=> st.classList.add("is-on"), 350 + i*520);
    });
    setTimeout(()=> result?.classList.add("is-on"), 350 + steps.length*520);

    pushLog();
    tradeLoop();
  }

  function stopS2(){
    active = false;
    clearTimeout(loopT);
    clearTimeout(logT);
  }

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) startS2();
      else stopS2();
    });
  }, {threshold: 0.6});

  obs.observe(s2v2);
}

/* pulse shadows brukt i S2 */
const pulseStyle = document.createElement("style");
pulseStyle.textContent = `
  .pulse-buy{
    box-shadow:0 0 0 1px rgba(110,255,191,.25),
              0 0 25px rgba(110,255,191,.35) !important;
  }
  .pulse-sell{
    box-shadow:0 0 0 1px rgba(255,168,107,.25),
              0 0 25px rgba(255,168,107,.35) !important;
  }
`;
document.head.appendChild(pulseStyle);
