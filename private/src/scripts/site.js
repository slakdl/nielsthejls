import { loadGlobe, drawGlobe } from "./globe.js";
import { createSpider, VW as SPIDER_W, VH as SPIDER_H } from "./spider.js";

// The line, the project unfold/fold, the index, bio, theme and grid.
// Content comes from src/content/projects via the JSON the page embeds.
const { WORK, IMAGES, FILLERS, SITES, CV, CONTACT } = JSON.parse(document.getElementById("data").textContent);

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const mod = (a, n) => ((a % n) + n) % n;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (t) => t * t * (3 - 2 * t);

// numbers → letters, as on the old site: characters appear left to right as
// flickering digits and settle into their letters. Mono font, so nothing shifts.
// write a label's text in place. Setting textContent swaps in a new text node, and when that
// happens under the cursor Chrome loses track of hover and never fires pointerout.
function setText(el, s) {
  const t = el.firstChild;
  if (t?.nodeType === 3 && !t.nextSibling) t.nodeValue = s;
  else el.textContent = s;
}
function decode(el, delay = 0, dur = 420) {
  const final = el.dataset.text ??= el.textContent;
  const t0 = performance.now() + delay, n = final.length;
  cancelAnimationFrame(el._decode);
  const frame = (now) => {
    const p = Math.min(1, Math.max(0, (now - t0) / dur));
    const shown = Math.ceil(n * Math.min(1, p * 1.6)), done = Math.floor(n * p);
    setText(el, [...final].map((c, i) => i >= shown ? " " : i < done || !/[a-z]/i.test(c) ? c : Math.floor(Math.random() * 10)).join(""));
    if (p < 1) el._decode = requestAnimationFrame(frame);
  };
  frame(performance.now());
}

// hover: a label flickers through digits, left to right, from what it shows now to `to`
const isLetter = (c) => /[a-z]/i.test(c ?? "");
function morph(el, to, dur = 320) {
  const from = el.textContent, n = to.length, t0 = performance.now();
  cancelAnimationFrame(el._decode); cancelAnimationFrame(el.firstChild?._raf); // whichever effect starts last owns the text
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / dur), lead = Math.ceil(n * Math.min(1, p * 1.6)), done = Math.floor(n * p);
    setText(el, [...to].map((c, i) =>
      i < done ? c : i < lead ? (isLetter(c) || isLetter(from[i]) ? Math.floor(Math.random() * 10) : c) : from[i] ?? c).join(""));
    if (p < 1) el._decode = requestAnimationFrame(frame);
  };
  frame(performance.now());
}
// mirrored: reversed, with brackets turned round so "(Light)" reads "(thgiL)", not ")thgiL("
const mirror = (s) => [...s].reverse().map((c) => ({ "(": ")", ")": "(" })[c] ?? c).join("");
// every button: hover → mirrored (Work → kroW), leave → back. Mouse only, so a tap doesn't
// leave a label mirrored; aria-label keeps the real name for screen readers.
// Contact links mirror their small label (Mail → liaM), never the address itself.
const BUTTONS = ".bar a, .bar button, .contact, .sheet a, .sheet button, #cap .more";
// remember every label's real text now, before any effect has scrambled it: reading it at
// hover time can catch it mid-animation and store digits as the "original"
const labelOf = (el) => el.querySelector(".k") ?? el;
document.querySelectorAll(BUTTONS).forEach((el) => (labelOf(el).dataset.text ??= labelOf(el).textContent));
for (const type of ["pointerover", "pointerout"]) addEventListener(type, (e) => {
  const el = e.target.closest?.(BUTTONS);
  if (!el || e.pointerType !== "mouse" || el.contains(e.relatedTarget)) return;
  const label = labelOf(el), text = label.dataset.text;
  if (label === el) el.setAttribute("aria-label", text);
  morph(label, type === "pointerover" ? mirror(text) : text);
});

// --- the line: real work, loose images, then grey squares
const BASE = [...WORK, ...IMAGES, ...Array.from({ length: FILLERS }, () => ({ w: 1, h: 1 }))];
const N = BASE.length;
const work = $("work");
// a video shows its poster until it plays; videos and live thumbnails only run while on screen (see playIfVisible)
const figure = (p, attrs, cls = "item") => p.live
  ? `<figure class="${cls} media" ${attrs} style="aspect-ratio:${p.w}/${p.h}"><canvas data-live="${p.live}" role="img" aria-label="${esc(p.title ?? "")}"></canvas></figure>`
  : p.video
  ? `<figure class="${cls} media" ${attrs} style="aspect-ratio:${p.w}/${p.h}"><video src="${p.video}" poster="${p.thumb}" width="${p.w}" height="${p.h}" muted loop playsinline preload="none" aria-label="${esc(p.title ?? "")}"></video></figure>`
  : p.thumb
  ? `<figure class="${cls} media" ${attrs} style="aspect-ratio:${p.w}/${p.h}"><img src="${p.thumb}" data-full="${p.full}" width="${p.w}" height="${p.h}" alt="${esc(p.title ?? "")}" decoding="async"></figure>`
  : `<figure class="${cls} ph" ${attrs} style="aspect-ratio:${p.w}/${p.h}" aria-hidden="true"></figure>`;
work.innerHTML = BASE.map((p, i) => figure(p, `data-i="${i}"`)).join("");
const els = [...work.children];

// thumbnails load small; an image gets its full version the first time it comes into focus,
// swapped in only once decoded so it never flashes
function upgrade(el) {
  const img = el.firstElementChild;
  if (img?.tagName !== "IMG" || img.dataset.up) return;
  img.dataset.up = "1";
  const full = new Image();
  full.src = img.dataset.full;
  full.decode().then(() => (img.src = full.src), () => {});
}

// --- physics. pos is a float in "items"; pos = 3 means item 3 sits on the column line.
// Every move is a glide: a timed curve from where the line is (keeping its current speed)
// to an exact image, so it speeds up, slows down and always lands dead on.
// ponytail: durations tuned by feel. glideFor = how long a move of d images takes.
const glideFor = (d) => clamp(0.35 + 0.18 * Math.sqrt(Math.abs(d)), 0.35, 1.4);
const SPRING = 70, DAMP = 2 * Math.sqrt(SPRING); // fallback only, if something leaves the line between images
const GROW_FOR = 0.5;   // seconds for the thumbnail to grow
const DEAL_AT = 0.18, DEAL_EACH = 0.07, DEAL_FOR = 0.6; // then each image slides out from behind it
// folding has its own ease-out timeline (playing the unfold backwards ends on a jolt):
// images slide back under the thumbnail, last one first, then the thumbnail shrinks
const FOLD_EACH = 0.05, FOLD_FOR = 0.45, FOLD_GROW_AT = 0.2, FOLD_GROW_FOR = 0.45;
const GAP = 10;
const INTRO_FOR = 1.3; // seconds for the entrance lap

let pos = 0, v = 0, target = 0, H = 0, HB = 0, h = 0, colX = 0, col4X = 0, maxFocusW = Infinity, cy = 0, capProject = 0, descTop = 0;
let dragging = false, raf = 0, last = 0, shown = "", glide = null, follow = null; // follow: { goal } while fingers are on the trackpad

// An open project's images are spliced into the line right after its thumbnail:
// line index j is the thumbnail, j+1 … j+R its images, everything after shifts by R.
// They start with zero advance, stacked behind the thumbnail, so the splice itself never shows.
let open = null; // { j, items: [{ p, el }], t, T, dir, next } + when folding: { c, Tc, g0, d0 }
const NL = () => N + (open ? open.items.length : 0);
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 4);
const grow = () => !open ? 0 : open.dir > 0 ? easeOut(open.t / GROW_FOR)
  : open.g0 * (1 - easeOut((open.c - FOLD_GROW_AT) / FOLD_GROW_FOR));
const deal = (r) => !open ? 0 : open.dir > 0 ? easeOut((open.t - DEAL_AT - r * DEAL_EACH) / DEAL_FOR)
  : open.d0[r] * (1 - easeOut((open.c - (open.items.length - 1 - r) * FOLD_EACH) / FOLD_FOR));
function at(k) {
  const i = mod(k, NL());
  if (!open || i <= open.j) return { p: BASE[i], el: els[i], member: !!open && i === open.j, i };
  const r = i - open.j - 1, R = open.items.length;
  if (r < R) return { ...open.items[r], member: true, rel: true, r };
  return { p: BASE[i - R], el: els[i - R], i: i - R };
}

function measure() {
  const small = innerWidth < 640;
  H = Math.round(innerHeight * (small ? 0.42 : 0.36));
  HB = Math.round(innerHeight * (small ? 0.5 : 0.56)); // the focused image of an open project
  h = Math.round(innerHeight * (small ? 0.14 : 0.15));
  document.documentElement.style.setProperty("--HB", HB + "px");
  // focused image starts on the counter's column; a phone's second column is mid-screen, so there it starts on the first
  colX = small ? colLeft(0) : $("count").getBoundingClientRect().left;
  col4X = colLeft(3);
  maxFocusW = small ? innerWidth - 2 * colX : col4X - GAP - colX; // phones have no column 4: the screen's width
  shown = ""; // re-measure the caption on the next render
  cy = innerHeight / 2;
  render(); drawGrid();
}

// size grows smoothly as an item approaches the line; inside an open project the focus grows bigger
function sizeOf(k, a) {
  // the image in focus may grow up to column 4, never into it: that column is the description's
  const top = Math.min(a.member ? H + (HB - H) * grow() : H, (maxFocusW * a.p.h) / a.p.w);
  return h + (top - h) * smooth(Math.max(0, 1 - Math.abs(k - pos)));
}
const advance = (k, a = at(k)) => ((sizeOf(k, a) * a.p.w) / a.p.h + GAP) * (a.rel ? deal(a.r) : 1);
// the same at thumbnail size: what the item on the line will take up once it has moved past
const thumbAdvance = (k, a = at(k)) => ((h * a.p.w) / a.p.h + GAP) * (a.rel ? deal(a.r) : 1);

function render() {
  const i0 = Math.floor(pos), f = pos - i0, LEFT = 6, n = NL();
  const rels = [];
  let xMain = 0, wMain = 0;
  const draw = (el, x, s) => {
    el.style.transform = `translate3d(${x}px,${cy - s / 2}px,0) scale(${s / HB})`;
    playIfVisible(el, x, x + (s * el.offsetWidth) / HB);
  };
  const place = (k, x) => {
    const a = at(k), s = sizeOf(k, a);
    if (s > h * 1.5) upgrade(a.el);
    if (a.rel) return rels.push([a, x, s]);
    if (a.member) { xMain = x; wMain = (s * a.p.w) / a.p.h; }
    draw(a.el, x, s);
  };
  // walk right from the item on the line, then left. The line item's offset is measured
  // in its thumbnail size, not its current size: that one shrinks as it slides off, and
  // f × a shrinking width runs backwards for a moment, which made everything wobble.
  const x0 = colX - f * thumbAdvance(i0);
  let x = x0;
  for (let k = i0; k < i0 + n - LEFT; k++) { place(k, x); x += advance(k); }
  x = x0;
  for (let k = i0 - 1; k >= i0 - LEFT; k--) { x -= advance(k); place(k, x); }
  // an open project's images travel from behind the thumbnail out to their slot. A cover can be
  // transparent (the live globe), so being behind it doesn't hide them: whatever part of an image
  // is still inside the cover's box is clipped away, so it truly slides out from behind it.
  const folding = open && (open.dir < 0 || open.t < open.T);
  for (const [a, x, s] of rels) {
    const xr = xMain + (x - xMain) * deal(a.r);
    draw(a.el, xr, s);
    const hidden = folding ? Math.max(0, xMain + wMain - xr) : 0; // on screen, px
    a.el.style.clipPath = hidden > 0 ? `inset(0 0 0 ${(hidden * HB) / s}px)` : ""; // in the element's own (unscaled) px
  }

  const kr = Math.round(pos), a = at(kr);
  const project = a.rel ? open.j : a.i, p = BASE[project];
  const isOpen = !!open && !open.closing;
  const key = `${project}.${a.rel ? a.r : ""}.${isOpen}`;
  capProject = project;
  if (key !== shown) {
    shown = key;
    $("count").textContent = `(${pad(project + 1)}/${pad(N)})`;
    const part = open && a.member ? `, ${(a.rel ? a.r + 2 : 1)}/${open.items.length + 1}` : "";
    const more = !isOpen && project < WORK.length ? `<button class="more" data-text="(Read more)">(Read more)</button>` : ""; // a nudge that projects open
    $("cap").innerHTML = `<b>(${pad(project + 1)})</b><span class="t">` + (p.thumb ? `${esc(p.title)}, ${esc(p.note)}, ${p.year}${part}` : `U<span class="flip">n</span>titled`) /* an empty slot: its N mirrored, like the mark */ + `</span>` + more;
    // a short caption is stacked one part per line, so the year and (Read more) sit where they do for the rest (three lines)
    const t = $("cap").querySelector(".t");
    if (p.thumb && t.getClientRects().length < 3) t.innerHTML = `${esc(p.title)},<br>${esc(p.note)},<br>${p.year}${part}`;
    capChanged = true;
  }
  const cap = $("cap");
  cap.style.left = colX + "px";
  cap.style.top = cy - HB / 2 - 16 + "px";
  // the description stands on column 3, level with the caption (under the image on a phone)
  // the description stands on column 4, its first line level with the caption's title line
  // (under the image on a phone). Measured only when the caption changes, not every frame.
  if (capChanged) { capChanged = false; descTop = cap.querySelector(".t").getBoundingClientRect().top; }
  const desc = $("desc"), small = innerWidth < 640;
  desc.style.left = (small ? colX : col4X) + "px";
  desc.style.top = (small ? cy + HB / 2 + 16 : descTop) + "px";
}
let capChanged = true;
// left edge of grid column n (0-based), read from the top bar's live grid
function colLeft(n) {
  const bar = document.querySelector(".bar"), cs = getComputedStyle(bar), cols = cs.gridTemplateColumns.split(" ").map(parseFloat);
  const gap = parseFloat(cs.columnGap) || 0, i = Math.min(n, cols.length - 1);
  return bar.getBoundingClientRect().left + parseFloat(cs.paddingLeft) + cols.slice(0, i).reduce((a, w) => a + w + gap, 0);
}

// videos and live thumbnails run only while on screen, and only on the Work page
const liveOn = new Set();
function playIfVisible(el, left, right) {
  const v = el.firstElementChild;
  if (v?.tagName !== "VIDEO" && v?.tagName !== "CANVAS") return;
  const on = page === "work" && right > 0 && left < innerWidth;
  if (on === !!el._on) return;
  el._on = on;
  if (v.tagName === "CANVAS") { on ? liveOn.add(v) : liveOn.delete(v); if (on) startLive(); return; }
  on ? v.play().catch(() => (el._on = false)) : v.pause();
}
// one loop draws every live thumbnail in view, at its on-screen size (rounded, so growing
// and shrinking doesn't reallocate the canvas every frame)
let liveRaf = 0;
function startLive() {
  if (liveRaf) return;
  const frame = (now) => {
    if (!liveOn.size) return (liveRaf = 0);
    const dpr = devicePixelRatio || 1;
    for (const cv of liveOn) {
      const r = cv.getBoundingClientRect(), w = Math.ceil((r.width * dpr) / 16) * 16, hh = Math.ceil((r.height * dpr) / 16) * 16;
      if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; }
      if (cv.dataset.live === "spider") (cv._spider ??= createSpider()).draw(cv, now);
      else drawGlobe(cv, now / 1000);
    }
    liveRaf = requestAnimationFrame(frame);
  };
  liveRaf = requestAnimationFrame(frame);
}
if (WORK.some((p) => p.live === "globe")) loadGlobe();

// an open project's description and role: written in as the project opens, scrambled out as it closes
function showDesc(p) {
  // each link as its address, readable (no mirror): host without www, plus the path if it has one
  const label = (u) => { const x = new URL(u); return x.host.replace(/^www\./, "") + x.pathname.replace(/\/(en\/?)?$/, ""); };
  const link = p?.links?.length ? `<span class="links">${p.links.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(label(u))} ↗</a>`).join("<br>")}</span>` : "";
  // any of description, role and link: a project can have just a link
  $("desc").innerHTML = (p?.description ? `<span>${esc(p.description)}</span>` : "") + (p?.studio ? `<i>Made at ${esc(p.studio)}</i>` : "") + (p?.role?.length ? `<i>${p.role.map(esc).join("<br>")}</i>` : "") /* one tag per line */ + link;
  if ($("desc").textContent) scramble("desc", false);
}

// inside an open project the wheel can't leave it: the ends pull back like a rubber band
const bounds = () => (open && open.dir > 0 ? [open.j, open.j + open.items.length] : [-Infinity, Infinity]);

function tick(now) {
  // a restarted loop's first frame can be stamped before wake() ran: never step backwards
  const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  // closing waits until the line is back on the cover, then folds
  if (open?.closing && open.dir > 0 && !glide && !follow && !dragging) Math.abs(pos - open.j) < 1e-3 ? fold() : glideTo(open.j);
  // landed on a thumbnail that's waiting to open (anything else, and the wait is off)
  if (pendingOpen && !glide && !follow && !dragging) { const { i, k } = pendingOpen; Math.abs(pos - k) < 1e-3 ? openProject(i) : (pendingOpen = null); }
  if (open) {
    if (open.dir > 0) open.t = Math.min(open.T, open.t + dt);
    else if ((open.c += dt) >= open.Tc) finishClose();
  }
  if (follow) {
    // fingers on the trackpad: chase the goal, tight enough to feel direct, loose enough to be smooth
    const next = pos + (follow.goal - pos) * (1 - Math.exp(-FOLLOW * dt));
    v = (next - pos) / dt; pos = next;
  } else if (glide) {
    // cubic Hermite: starts at the current speed, ends at zero speed exactly on p1
    const g = glide, t = clamp((now - g.t0) / 1000 / g.dur, 0, 1), t2 = t * t, t3 = t2 * t;
    const next = g.curve ? g.p0 + (g.p1 - g.p0) * g.curve(t)
      : (2 * t3 - 3 * t2 + 1) * g.p0 + (t3 - 2 * t2 + t) * g.dur * g.v0 + (3 * t2 - 2 * t3) * g.p1;
    v = (next - pos) / dt; pos = next;
    if (t === 1) { glide = null; pos = target = g.p1; v = 0; }
  } else if (!dragging) {
    if (target === null) target = clamp(Math.round(pos), ...bounds());
    v += (-SPRING * (pos - target) - DAMP * v) * dt;
    pos += v * dt;
    const unfolding = open && (open.dir < 0 || open.t < open.T);
    if (target !== null && !unfolding && Math.abs(pos - target) < 0.0005 && Math.abs(v) < 0.005) {
      pos = target; v = 0; render(); raf = 0; return; // at rest: stop the loop
    }
  }
  render();
  raf = requestAnimationFrame(tick);
}
const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
// `curve` (0→1 over 0→1) replaces the Hermite for a one-off shape of motion, like the entrance
function glideTo(k, dur = glideFor(k - pos), v0 = v, t0 = performance.now(), curve = null) {
  follow = null; target = k; glide = { p0: pos, v0, p1: k, t0, dur, curve }; wake();
}
const nearest = (i) => { const r = Math.round(pos); return r + (mod(i - r + N / 2, N) - N / 2); };
const goTo = (i) => glideTo(nearest(i));
// one image left or right, queued onto a glide already under way
function step(s) {
  if (open?.closing) return;
  pendingOpen = null;
  const [lo, hi] = bounds();
  glideTo(clamp((glide ? glide.p1 : target ?? Math.round(pos)) + s, lo, hi));
}

// Opening is strictly in order: (close whatever is open →) glide onto the thumbnail with nothing
// open → only then grow and unfold. Unfolding while still travelling made long jumps a mess.
let pendingOpen = null; // { i, k }: open project i once the line has landed on line index k
function openProject(i) {
  if (open) return (open.next = i, closeProject());
  const k = nearest(i);
  if (Math.abs(pos - k) > 1e-3) { pendingOpen = { i, k }; return glideTo(k); }
  pendingOpen = null;
  // re-frame so the thumbnail sits at index i, then make room after it
  pos -= k - i;
  const R = WORK[i].images.length;
  if (pos > i) pos += R;
  const items = WORK[i].images.map((p, r) => {
    work.insertAdjacentHTML("beforeend", figure(p, `data-r="${r}"`, "item rel"));
    return { p, el: work.lastElementChild };
  });
  const T = Math.max(GROW_FOR, DEAL_AT + (R - 1) * DEAL_EACH + DEAL_FOR);
  open = { j: i, items, t: 0, T, dir: 1 };
  els[i].style.zIndex = 2; // the thumbnail stays on top while its images slide out from under it
  glideTo(i); note(); showDesc(WORK[i]);
}
function note() {
  $("note").innerHTML = `<span>← → Scroll</span>` + (open && !open.closing ? `<span>Esc Exit project</span>` : `<span>↵ Enter project</span>`);
}
// Closing is two moves in a row: glide back to the cover, then fold. Doing both at once
// lets the cover drift (the line is anchored to whatever image is on the column) while
// its images are tucking in behind it.
function closeProject() {
  if (!open || open.closing) return;
  open.closing = true; note(); wake(); // tick() takes it from here
  scramble("desc", true);
}
function fold() {
  // fold from wherever the unfold got to, so an early Esc doesn't jump
  open.g0 = grow(); open.d0 = open.items.map((_, r) => deal(r));
  open.dir = -1; open.c = 0;
  open.Tc = Math.max(FOLD_GROW_AT + FOLD_GROW_FOR, (open.items.length - 1) * FOLD_EACH + FOLD_FOR);
}
function finishClose() {
  const { j, items, next } = open, R = items.length;
  items.forEach((it) => it.el.remove());
  els[j].style.zIndex = "";
  const remap = (x) => (x > j ? Math.max(j, x - R) : x);
  pos = remap(pos);
  if (target !== null) target = remap(target);
  if (glide) { glide.p0 = remap(glide.p0); glide.p1 = remap(glide.p1); }
  open = null; shown = "";
  $("desc").innerHTML = ""; // gone for good, so returning to Work can't decode it back in
  if (next !== undefined) openProject(next);
}

// wheel / trackpad: the line follows the fingers directly, so even the tiniest movement moves it.
// Once the movement fades (fingers lifted, or the trackpad's own momentum dying out) it glides
// onto the nearest image instead of creeping there. A fresh swipe takes over again at once.
// ponytail: tuned by feel against simulated trackpad streams.
const WHEEL_GAIN = 0.6;  // line movement per wheel pixel, in thumbnail widths (1 ≈ page scrolling)
const FOLLOW = 28;       // how tightly the line tracks the fingers, per second
const LAND_BELOW = 2.5;  // images/sec: a fading momentum tail hands over to the landing below this
let wheelV = 0, lastT = 0, lastAbs = 0, fading = 0, quietT = 0, tailIgnored = false;
work.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (open?.closing) return;
  const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 16 : 1);
  if (!d) return;
  const a = Math.abs(d), fresh = a > lastAbs * 1.3 && a > 3;
  fading = a < lastAbs ? fading + 1 : 0; // a momentum tail shrinks on every event
  lastAbs = a;
  clearTimeout(quietT);
  quietT = setTimeout(() => { lastAbs = fading = 0; tailIgnored ? (tailIgnored = false) : land(); }, 90);
  if (tailIgnored && !fresh) return; // the rest of a tail we already landed
  tailIgnored = false;
  if (!follow) { follow = { goal: pos }; glide = null; target = null; pendingOpen = null; }
  const [lo, hi] = bounds();
  const di = (d * WHEEL_GAIN) / (h + GAP);
  // past a project's ends the line gives a little, with resistance, rather than hitting a wall
  const outside = follow.goal < lo || follow.goal > hi;
  follow.goal = clamp(follow.goal + di * (outside ? 0.3 : 1), lo - 0.35, hi + 0.35);
  const dt = clamp((e.timeStamp - lastT) / 1000, 0.004, 0.1);
  lastT = e.timeStamp;
  wheelV = 0.7 * wheelV + 0.3 * (di / dt);
  // land once the push fades; past an end, bounce back as soon as it starts to fade
  if (outside ? fading >= 2 : fading >= 4 && Math.abs(wheelV) < LAND_BELOW) { land(); tailIgnored = true; }
  wake();
}, { passive: false });

// glide from the current speed onto the image just ahead of where the line is heading
function land() {
  if (!follow) return;
  const [lo, hi] = bounds();
  const k = clamp(Math.round(pos + v * 0.12), lo, hi), dist = Math.abs(k - pos);
  glideTo(k, Math.abs(v) > 0.5 ? clamp((2 * dist) / Math.abs(v), 0.22, 0.5) : clamp(0.25 + 0.3 * dist, 0.25, 0.45), v);
}

// drag: the line follows the pointer, release throws it
// ponytail: tuned by feel. A finger on a phone moved (and flung) the line twice as far as felt right
const TOUCH_GAIN = 0.5;
let px = 0, pt = 0, moved = 0, vel = 0;
work.addEventListener("pointerdown", (e) => {
  dragging = true; glide = null; follow = null; target = null; pendingOpen = null; v = 0; px = e.clientX; pt = e.timeStamp; moved = 0; vel = 0;
  work.setPointerCapture(e.pointerId); work.classList.add("drag"); wake();
});
work.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - px, dt = Math.max(1, e.timeStamp - pt) / 1000;
  const [lo, hi] = bounds();
  let di = (-dx / (h + GAP)) * (e.pointerType === "touch" ? TOUCH_GAIN : 1); // one thumb width = one item
  if (pos < lo || pos > hi) di *= 0.35; // resistance past the ends of an open project
  pos += di; moved += Math.abs(dx);
  vel = 0.7 * (di / dt) + 0.3 * vel;
  px = e.clientX; pt = e.timeStamp;
});
work.addEventListener("pointerup", (e) => {
  if (!dragging) return;
  dragging = false; work.classList.remove("drag");
  if (moved < 5) { // a click, not a throw
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.classList?.contains("item"));
    if (el?.dataset.r !== undefined && open) {
      // the spider panel, once it's the image in focus, is played with: a click sends it walking there
      const k = open.j + 1 + +el.dataset.r, cv = el.querySelector('canvas[data-live="spider"]');
      if (cv?._spider && k === Math.round(pos)) {
        const r = cv.getBoundingClientRect();
        return cv._spider.crawlTo(((e.clientX - r.left) / r.width) * SPIDER_W, ((e.clientY - r.top) / r.height) * SPIDER_H);
      }
      return glideTo(k);
    }
    const i = el ? +el.dataset.i : null;
    if (open && (i === null || i === open.j || i >= WORK.length)) return closeProject();
    if (i !== null && i < WORK.length) return openProject(i);
    if (i !== null) return goTo(i);
  }
  const throwV = e.timeStamp - pt > 80 ? 0 : vel;
  const k = clamp(Math.round(pos + throwV * 0.3), ...bounds());
  // a constant-deceleration stop over distance d at speed v takes 2d/v
  glideTo(k, clamp(Math.abs(throwV) > 0.5 ? (2 * Math.abs(k - pos)) / Math.abs(throwV) : 0.35, 0.3, 1.2), throwV);
});

addEventListener("keydown", (e) => {
  if (e.key === "g" || e.key === "G") return toggleGrid();
  if (location.hash && location.hash !== "#work") return;
  if (e.key === "Escape") return sheetOpen() ? closeSheet() : closeProject();
  if (e.key === "Enter" && !open && !e.target.closest?.("a, button")) {
    const a = at(Math.round(target ?? pos));
    if (a.i < WORK.length) return openProject(a.i);
  }
  const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
  if (dir) step(dir);
});
addEventListener("resize", measure);
$("cap").addEventListener("click", (e) => { if (e.target.closest(".more")) openProject(capProject); });

// --- contact sheet: Contact slides it up and its text decodes in; Esc, (Close), Contact again
// or a click anywhere outside slides it away. Without JS, Contact is a plain mailto link.
const sheet = $("sheet");
const sheetOpen = () => sheet.classList.contains("open");
function openSheet() {
  sheet.classList.add("open"); sheet.inert = false;
  $("contact").setAttribute("aria-expanded", "true");
  scramble("sheet", false);
  sheet.querySelector(".ct").focus({ preventScroll: true });
}
function closeSheet() {
  if (!sheetOpen()) return;
  sheet.classList.remove("open"); sheet.inert = true;
  $("contact").setAttribute("aria-expanded", "false");
  scramble("sheet", true);
  $("contact").focus({ preventScroll: true });
}
$("contact").addEventListener("click", (e) => { e.preventDefault(); sheetOpen() ? closeSheet() : openSheet(); });
$("sheet-close").onclick = closeSheet;
// outside click: close, and swallow it so it doesn't also grab the line
addEventListener("pointerdown", (e) => {
  if (sheetOpen() && !sheet.contains(e.target) && !$("contact").contains(e.target)) { e.stopPropagation(); closeSheet(); }
}, true);

// --- grid overlay
function toggleGrid() {
  $("grid").hidden = !$("grid").hidden;
  $("gridbtn").setAttribute("aria-pressed", !$("grid").hidden);
  drawGrid();
}
// read straight from the live layout, so it shows what the page actually uses
function drawGrid() {
  const g = $("grid");
  if (g.hidden) return;
  const cols = getComputedStyle(document.querySelector(".bar")).gridTemplateColumns.split(" ");
  const css = getComputedStyle(root), m = css.getPropertyValue("--pad").trim(), gut = css.getPropertyValue("--gap").trim();
  const line = (y, label) => `<b style="top:${Math.round(y)}px"><span>${label}</span></b>`;
  g.innerHTML =
    `<div class="cols" style="grid-template-columns:repeat(${cols.length},1fr)">` +
    cols.map((w, i) => `<i>(C${i + 1}) ${Math.round(parseFloat(w))}</i>`).join("") + `</div>` +
    line(cy - HB / 2, `Open top ${HB}`) + line(cy - H / 2, `Focus top ${H}`) + line(cy - h / 2, `Thumb top ${h}`) +
    line(cy, "Axis") +
    line(cy + h / 2, "Thumb bottom") + line(cy + H / 2, "Focus bottom") + line(cy + HB / 2, "Open bottom") +
    `<span class="legend">${cols.length} cols · ${m} margin · ${gut} gutter · ${innerWidth}×${innerHeight}</span>`;
}
$("gridbtn").onclick = toggleGrid;

// --- index + bio
const row = (cells) => `<li>${cells.map((c) => `<span>${c}</span>`).join("")}</li>`;
$("rows").innerHTML =
  `<h2>Work</h2>` +
  WORK.map((p, i) => row([`<i>(${pad(i + 1)})</i><a href="#work" data-go="${i}">${esc(p.title)}</a>`, esc(p.note), p.year])).join("") +
  `<h2>Sites</h2>` +
  SITES.map((s, i) => row([`<i>(${pad(i + 1)})</i><a href="https://${s}" target="_blank" rel="noopener">${s} ↗</a>`, "Website", ""])).join("");
$("rows").addEventListener("click", (e) => { const a = e.target.closest("[data-go]"); if (a) setTimeout(() => openProject(+a.dataset.go), OUT_FOR + 160); });
$("cv").innerHTML = Object.entries(CV).map(([t, list]) =>
  `<h2>${t}</h2>` + list.map(([org, role, yr], i) => row([`<i>(${pad(i + 1)})</i>${org}`, role, yr])).join("")).join("");

// --- theme: charcoal by default, light is opt-in and remembered
const root = document.documentElement;
const label = () => setText($("theme"), ($("theme").dataset.text = root.dataset.theme === "light" ? "(Dark)" : "(Light)"));
$("theme").onclick = () => {
  if (root.dataset.theme === "light") delete root.dataset.theme; else root.dataset.theme = "light";
  try { localStorage.theme = root.dataset.theme || "dark"; } catch (e) {}
  label();
  const text = $("theme").dataset.text;
  $("theme").setAttribute("aria-label", text);
  morph($("theme"), $("theme").matches(":hover") ? mirror(text) : text); // still hovered: show the new label mirrored
};
label();

// --- views via hash. Switching pages plays numbers → letters both ways: the old page's text
// flickers into digits and vanishes, left to right, then the new page's text decodes in,
// cascading down the page. Works on text nodes, so links and markup inside rows survive.
const OUT_FOR = 260, IN_FOR = 420; // ms per piece of text
const OUT_STAGGER = 6, IN_STAGGER = 14, IN_STAGGER_MAX = 360; // ms between pieces, top to bottom
const ALNUM = /[\p{L}\p{N}]/u;
let page = null, switching = 0;
const pageId = () => (["index", "bio"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "work");
const textRoots = (id) => (id === "work" ? [$("count"), $("cap"), $("desc"), $("note")] : id === "bio" ? [$("name"), $(id)] : [$(id)]);
function textNodes(id) {
  const nodes = [];
  for (const root of textRoots(id)) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    // judge by the original text: a scrambled-out node is all no-break spaces, which trim() drops
    while (walk.nextNode()) if ((walk.currentNode._final ?? walk.currentNode.nodeValue).trim()) nodes.push(walk.currentNode);
  }
  return nodes;
}
// one text node: a leading wave turns characters into flickering digits, a trailing wave
// settles them (in) or blanks them (out). Spaces stay spaces and blanks are no-break spaces of
// the same width (mono), so lines never reflow mid-effect.
function scrambleNode(node, delay, dur, out) {
  const final = (node._final ??= node.nodeValue), n = final.length, t0 = performance.now() + delay;
  cancelAnimationFrame(node._raf); cancelAnimationFrame(node.parentNode?._decode);
  const frame = (now) => {
    const p = clamp((now - t0) / dur, 0, 1), lead = Math.ceil(n * Math.min(1, p * 1.6)), done = Math.floor(n * p);
    node.nodeValue = [...final].map((c, i) => {
      if (c === " ") return c;
      if (out) return i < done ? "\u00a0" : i < lead && ALNUM.test(c) ? Math.floor(Math.random() * 10) : c;
      return i >= lead ? "\u00a0" : i < done || !ALNUM.test(c) ? c : Math.floor(Math.random() * 10);
    }).join("");
    if (p < 1) node._raf = requestAnimationFrame(frame);
  };
  frame(performance.now());
}
const scramble = (id, out) => textNodes(id).forEach((n, i) =>
  scrambleNode(n, out ? i * OUT_STAGGER : Math.min(i * IN_STAGGER, IN_STAGGER_MAX), out ? OUT_FOR : IN_FOR, out));
// --- letters → image. An element is drawn as a grid of characters: flickering digits sweep
// in, settle left to right into letters whose density follows the image's brightness (denser
// where brighter on the dark theme, darker on the light one), and then the element fades up
// through them. One full-screen canvas draws every reveal at the element's live position.
const RAMP = "MWNB8QDR0HKAEXSZ5U6C9GP43V2Y7FJTL1I"; // densest → lightest
const overlay = $("ascii"), octx = overlay.getContext("2d");
let reveals = [], revealRaf = 0;
function reveal(el, { delay = 0, fs = 6 } = {}) {
  const r = el.getBoundingClientRect();
  if (!r.width || r.right < 0 || r.left > innerWidth) return; // off screen: nothing to draw
  const vid = el.querySelector("video");
  let img = el.querySelector("img") ?? (vid && Object.assign(new Image(), { src: vid.poster })) ?? el.querySelector("canvas");
  const cols = Math.max(1, Math.floor(r.width / (fs * 0.6))), rows = Math.max(1, Math.floor(r.height / fs));
  const it = { el, cols, rows, lum: null, t0: performance.now() + delay, t1: 0 };
  el.style.transition = "none"; el.style.opacity = 0;
  const sample = () => {
    it.lum = lumOf(img ?? (el.classList.contains("ph") ? paintMark(el, r.width, r.height) : getComputedStyle(el).backgroundColor), cols, rows);
    it.t1 = Math.max(performance.now(), it.t0 + 250); // always show the digits for a moment
  };
  img?.decode ? img.decode().then(sample, () => { img = null; sample(); }) : sample(); // a canvas needs no decoding
  reveals = reveals.filter((x) => x.el !== el).concat(it);
  if (!revealRaf) revealRaf = requestAnimationFrame(drawReveals);
}
// brightness per grid cell, 0–1: from an image, or a flat colour (a grey placeholder)
function lumOf(src, cols, rows) {
  const s = document.createElement("canvas"); s.width = cols; s.height = rows;
  const c = s.getContext("2d");
  if (typeof src === "function") src(c, cols, rows);
  else if (typeof src === "string") { c.fillStyle = src; c.fillRect(0, 0, cols, rows); } else c.drawImage(src, 0, 0, cols, rows);
  const d = c.getImageData(0, 0, cols, rows).data;
  return Array.from({ length: cols * rows }, (_, i) => (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255);
}
// an empty slot, as the reveal sees it: the page's ground with the mirrored N in the slot's grey,
// fitted the way the CSS mask fits it (contain, centred), so the letters form the N, not a box
const N_MARK = Object.assign(new Image(), { src: "/favicon.svg" });
function paintMark(el, w, h) {
  return (c, cols, rows) => {
    c.fillStyle = getComputedStyle(document.body).backgroundColor; c.fillRect(0, 0, cols, rows);
    if (!N_MARK.naturalWidth) return;
    const side = Math.min(w, h), bw = (side / w) * cols, bh = (side / h) * rows;
    const t = document.createElement("canvas"); t.width = cols; t.height = rows;
    const tc = t.getContext("2d");
    tc.drawImage(N_MARK, (cols - bw) / 2, (rows - bh) / 2, bw, bh);
    tc.globalCompositeOperation = "source-in"; tc.fillStyle = getComputedStyle(el).backgroundColor; tc.fillRect(0, 0, cols, rows);
    c.drawImage(t, 0, 0);
  };
}
const cellChar = (v, light) => { // letter for a brightness, denser where it's "inkier" on this theme
  const k = light ? 1 - v : v;
  return k < 0.08 ? "" : RAMP[Math.floor((1 - k) * (RAMP.length - 1))];
};

// --- Bio: scrolling down disintegrates the portrait, so the rows scrolling up never touch it.
// Scroll position drives it directly (scrubbable both ways): the photo gives way to its letter
// picture, letters break into flickering digits at random, and the digits drift up and vanish.
// It is fully gone by the time the first row would reach the photo.
let dustGrid = null; // { cols, rows, lum, seeds } built once per Bio visit
function dust() {
  const fig = $("portrait"), img = fig.querySelector("img"), cv = fig.querySelector("canvas");
  const li = $("cv").querySelector("li");
  if (fig.hidden || !li || !img.complete) return;
  const bio = $("bio"), reach = li.getBoundingClientRect().top + bio.scrollTop - fig.getBoundingClientRect().bottom;
  const p = clamp(bio.scrollTop / Math.max(reach, 40), 0, 1);
  const w = img.clientWidth, h = img.clientHeight, LIFT = 16, fs = 6, dpr = devicePixelRatio || 1;
  if (p > 0 && reveals.some((x) => x.el === fig)) { reveals = reveals.filter((x) => x.el !== fig); fig.style.opacity = ""; }
  if (!dustGrid) {
    const cols = Math.floor(w / (fs * 0.6)), rows = Math.floor(h / fs);
    dustGrid = { cols, rows, lum: lumOf(img, cols, rows), seeds: Array.from({ length: cols * rows }, () => [Math.random(), Math.random(), 0.4 + Math.random()]) };
  }
  const { cols, rows, lum, seeds } = dustGrid, sx = w / cols, ctx = cv.getContext("2d"), light = root.dataset.theme === "light";
  if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = (h + LIFT) * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h + LIFT);
  img.style.transition = "none";
  img.style.opacity = p ? 1 - clamp(p / 0.15, 0, 1) : "";
  if (!p) return;
  ctx.fillStyle = getComputedStyle(fig).color;
  ctx.font = `500 ${fs}px "IBM Plex Mono", monospace`;
  ctx.textBaseline = "top";
  for (let i = 0; i < cols * rows; i++) {
    const base = cellChar(lum[i], light);
    if (!base) continue;
    const [a, b, drift] = seeds[i], toDigit = 0.12 + a * 0.4, gone = 0.35 + b * 0.62;
    if (p >= gone) continue;
    ctx.globalAlpha = (1 - clamp((p - gone + 0.1) / 0.1, 0, 1)) * clamp(p / 0.15, 0, 1);
    const lift = Math.max(0, p - toDigit) * drift * LIFT;
    ctx.fillText(p >= toDigit ? String(Math.floor(Math.random() * 10)) : base, (i % cols) * sx, LIFT + Math.floor(i / cols) * fs - lift);
  }
  ctx.globalAlpha = 1;
}
let dustRaf = 0;
$("bio").addEventListener("scroll", () => { if (!dustRaf) dustRaf = requestAnimationFrame(() => { dustRaf = 0; dust(); }); }, { passive: true });

function unreveal(el) {
  reveals = reveals.filter((x) => x.el !== el);
  el.style.transition = "opacity .25s"; el.style.opacity = 0;
}
function drawReveals(now) {
  const dpr = devicePixelRatio || 1, W = innerWidth, Hh = innerHeight, light = root.dataset.theme === "light";
  if (overlay.width !== W * dpr || overlay.height !== Hh * dpr) { overlay.width = W * dpr; overlay.height = Hh * dpr; }
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  octx.clearRect(0, 0, W, Hh);
  octx.fillStyle = getComputedStyle(document.body).color;
  octx.textBaseline = "top";
  reveals = reveals.filter((it) => {
    if (now < it.t0) return true;
    const settle = it.lum ? clamp((now - it.t1) / 500, 0, 1) : 0;
    const fade = settle === 1 ? clamp((now - it.t1 - 500) / 450, 0, 1) : 0;
    if (fade === 1) { it.el.style.opacity = ""; return false; }
    it.el.style.opacity = fade;
    const r = it.el.getBoundingClientRect(), sx = r.width / it.cols, sy = r.height / it.rows;
    const appear = clamp((now - it.t0) / 300, 0, 1) * 1.6;
    octx.globalAlpha = 1 - fade;
    octx.font = `500 ${sy}px "IBM Plex Mono", monospace`;
    for (let y = 0; y < it.rows; y++) for (let x = 0; x < it.cols; x++) {
      const u = x / it.cols;
      if (u > appear) continue;
      let ch = String(Math.floor(Math.random() * 10));
      if (it.lum && u < settle) ch = cellChar(it.lum[y * it.cols + x], light);
      if (ch) octx.fillText(ch, r.left + x * sx, r.top + y * sy);
    }
    return true;
  });
  octx.globalAlpha = 1;
  revealRaf = reveals.length ? requestAnimationFrame(drawReveals) : 0;
}
// back on Work: every image in view reveals, sweeping left to right across the screen
function lineIn() {
  for (const el of work.querySelectorAll(".item")) {
    const x = el.getBoundingClientRect().left;
    if (x < innerWidth && x > -innerWidth) reveal(el, { delay: clamp(x / innerWidth, 0, 1) * 300, fs: 7 });
  }
}

function show(id) {
  // videos rest off the Work page; back on it, the next render starts the ones in view
  if (id !== "work") {
    work.querySelectorAll("video").forEach((v) => { v.pause(); v.parentElement._on = false; });
    work.querySelectorAll("canvas").forEach((c) => { liveOn.delete(c); c.parentElement._on = false; });
  }
  else requestAnimationFrame(render);
  document.querySelectorAll("main > section").forEach((s) => (s.hidden = s.id !== id));
  $("portrait").hidden = $("name").hidden = id !== "bio"; // the name and portrait belong to Bio
  for (const el of [$("count"), $("cap"), $("desc"), $("note")]) el.style.visibility = id === "work" ? "" : "hidden";
}
function view() {
  const id = pageId(), token = ++switching;
  document.querySelectorAll("nav a").forEach((a) => a.hash === "#" + id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  if (page === null || page === id) { // first load, or the same page again
    show(id);
    if (page === null && id !== "work") scramble(id, false);
    if (page === null && id === "bio") reveal($("portrait"));
    page = id;
    return;
  }
  scramble(page, true);
  if (page === "work") work.style.opacity = 0;
  if (page === "bio") unreveal($("portrait"));
  const outFor = OUT_FOR + Math.min(textNodes(page).length * OUT_STAGGER, 120);
  setTimeout(() => {
    if (token !== switching) return; // a newer click took over
    show(id); page = id;
    if (id === "work") { work.style.transition = "none"; work.style.opacity = 1; lineIn(); requestAnimationFrame(() => (work.style.transition = "")); }
    else $(id).scrollTop = 0;
    scramble(id, false);
    if (id === "bio") { dustGrid = null; dust(); reveal($("portrait")); }
  }, outFor);
}
addEventListener("hashchange", view);
note();
view();
measure();
document.fonts.ready.then(measure); // counter's column can shift once the font loads

// entrance: the line speeds up and slows into item 01, the labels decode
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // a whole lap of the line: kicked to full speed almost at once, then a long braking glide in
  pos = -N; glideTo(0, INTRO_FOR, 0, performance.now() + 120, (t) => 1 - Math.pow(1 - Math.pow(t, 1.35), 4));
  document.querySelectorAll(".bar a, .bar button, .contact").forEach((el, i) => decode(el, 80 + i * 70));
}
