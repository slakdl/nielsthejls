// The spider from nielsthejls.com: the web's body grows legs and walks to where you click.
// Ported from its d3/SVG version (old site, assets/js/app.js) to plain canvas: the same leg
// rules, the same springs, the same walk. It lives in a virtual 1440×900 page, scaled into
// whatever canvas it is drawn in, and wanders on its own when nobody is directing it.
//
// The old site's notes, kept: each leg is two strings with a random shape at the knee and
// another at the foot. Every leg picks its own footholds (near or far, so it bends tight or
// stretches wide), its own step length, speed and restlessness, and fidgets while the bug
// stands still. No more than three legs lifted, never two neighbours on one side unless a leg
// is overstretched. The bug thinks for a moment, then walks, swinging round the short way; it
// hesitates now and then, and its body slows while legs are lifted, so each step carries weight.
export const VW = 1440, VH = 900;
const C = { bg: "#f5f4ef", ink: "#1a1a1a", muted: "#b3b0a8", accent: "#e2572b" };

const HIP_ANGLES = [34, 68, 112, 148]; // degrees from the heading, front to back
const UPPER = 78, LOWER = 96; // leg segment lengths
const REACH = 128; // body to a comfortable foothold
const WALK_SPEED = 120; // px per second
const REST_BEFORE_FOLD = 700; // ms after arriving
const BODY_MARGIN = 70; // keeps the body far enough in for its legs
const FOLD_MS = 240; // each leg's snap back into the body
const SHAPE_FULL_AT = 36; // px from the body where knee/foot shapes reach full size
const SPRING = 0.22, DAMPING = 0.3; // per tick, as the d3 forceX/forceY + velocityDecay were
const BODY_SLOT = 34 * 0.62, LEG_SLOT = 22 * 0.62; // shape sizes, from the old font-size rules
const WANDER = [2600, 5200]; // ms of rest before it sets off somewhere on its own

const SHAPES = [["square", 1], ["square", 0.75], ["square", 0.5], ["circle", 1], ["up", 1], ["down", 1]];
const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];
const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const dirAt = (a) => ({ x: Math.cos(a), y: Math.sin(a) });
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const view = { left: 24, top: 24, right: VW - 24, bottom: VH - 44 };
const keepInView = (p) => ({ x: clamp(p.x, view.left, view.right), y: clamp(p.y, view.top, view.bottom) });

// a shape centred on (0, 0), side `a`: squares and triangles keep sharp corners
function shape(ctx, [kind, scale], slot) {
  const a = slot * scale, h = a / 2;
  ctx.beginPath();
  if (kind === "square") ctx.rect(-h, -h, a, a);
  else if (kind === "circle") ctx.arc(0, 0, h, 0, Math.PI * 2);
  else if (kind === "up") { ctx.moveTo(0, -h); ctx.lineTo(h, h); ctx.lineTo(-h, h); }
  else { ctx.moveTo(-h, -h); ctx.lineTo(h, -h); ctx.lineTo(0, h); }
  ctx.fill();
}

export function createSpider() {
  const body = { x: VW / 2, y: VH / 2 };
  const s = {
    target: null, phase: "rest", phaseUntil: 0, heading: -Math.PI / 2, travel: { x: 0, y: -1 }, speed: 0,
    legsOut: false, folding: false, restingSince: 0, wanderAt: 0, now: 0, last: 0, marker: 0, legs: [],
    bodyShape: randomShape(),
  };
  [-1, 1].forEach((side) => HIP_ANGLES.forEach((deg, i) => s.legs.push({
    side, index: i, front: i < 2, angle: (side * deg * Math.PI) / 180, foot: null, from: null, to: null,
    t0: 0, stepMs: 0, bulge: 0, popAt: 0, foldAt: 0, restless: rand(26, 72), alpha: 0,
    kneeShape: randomShape(), footShape: randomShape(),
    knee: { x: body.x, y: body.y, vx: 0, vy: 0 }, footP: { x: body.x, y: body.y, vx: 0, vy: 0 },
  })));

  const restSpot = (leg, lead) => {
    const d = dirAt(s.heading + leg.angle), v = s.travel;
    return { x: body.x + d.x * REACH + v.x * lead, y: body.y + d.y * REACH + v.y * lead };
  };
  const chooseFoothold = (leg, lead) => {
    const a = s.heading + leg.angle + rand(-0.22, 0.22), reach = REACH * rand(0.6, 1.18), ahead = lead * rand(0.5, 1.5);
    return keepInView({ x: body.x + Math.cos(a) * reach + s.travel.x * ahead, y: body.y + Math.sin(a) * reach + s.travel.y * ahead });
  };
  // two-segment IK; front knees point forward, back knees backward, mirrored left and right
  const knee = (leg) => {
    const f = leg.foot, dx = f.x - body.x, dy = f.y - body.y;
    const d = clamp(Math.hypot(dx, dy), 1, UPPER + LOWER - 0.5);
    const a = Math.acos(clamp((UPPER * UPPER + d * d - LOWER * LOWER) / (2 * UPPER * d), -1, 1));
    const base = Math.atan2(dy, dx), v = dirAt(s.heading);
    const k1 = { x: body.x + Math.cos(base + a) * UPPER, y: body.y + Math.sin(base + a) * UPPER };
    const k2 = { x: body.x + Math.cos(base - a) * UPPER, y: body.y + Math.sin(base - a) * UPPER };
    const ahead = (k) => (k.x - body.x) * v.x + (k.y - body.y) * v.y;
    return keepInView(ahead(k1) > ahead(k2) === leg.front ? k1 : k2);
  };
  // where a knee or foot is being pulled: out to its pose, or folding back into the body
  const goal = (leg, part) => {
    if (!leg.foot || (s.legsOut && s.now < leg.popAt)) return body;
    const pose = part === "knee" ? knee(leg) : leg.foot;
    if (s.legsOut) return pose;
    const t = clamp((s.now - leg.foldAt) / FOLD_MS, 0, 1), out = (1 - t) * (1 - t);
    return { x: body.x + (pose.x - body.x) * out, y: body.y + (pose.y - body.y) * out };
  };
  function stepPhysics(dt) {
    let settled = true;
    for (let i = Math.max(1, Math.min(3, Math.round(dt * 60))); i > 0; i--)
      for (const leg of s.legs) for (const [p, part] of [[leg.knee, "knee"], [leg.footP, "foot"]]) {
        const g = goal(leg, part);
        p.vx = (p.vx + (g.x - p.x) * SPRING) * (1 - DAMPING); p.x += p.vx;
        p.vy = (p.vy + (g.y - p.y) * SPRING) * (1 - DAMPING); p.y += p.vy;
        if (Math.abs(g.x - p.x) + Math.abs(g.y - p.y) > 0.5 || Math.abs(p.vx) + Math.abs(p.vy) > 0.05) settled = false;
      }
    return settled;
  }
  // each leg shoots out toward its first foothold, a few ms apart, kicked so it overshoots
  function popLegs(now) {
    const midFold = s.folding;
    s.legsOut = true; s.folding = false;
    for (const leg of s.legs) {
      leg.foot = chooseFoothold(leg, 0); leg.to = null; leg.alpha = 1;
      leg.popAt = midFold ? now : now + rand(0, 40);
      if (midFold) continue;
      const kick = { knee: knee(leg), foot: leg.foot };
      for (const [p, part] of [[leg.knee, "knee"], [leg.footP, "foot"]]) {
        p.x = body.x + rand(-3, 3); p.y = body.y + rand(-3, 3);
        p.vx = (kick[part].x - p.x) * 0.42; p.vy = (kick[part].y - p.y) * 0.42;
      }
    }
  }
  function foldLegs(now) {
    s.legsOut = false; s.folding = true;
    for (const leg of s.legs) { leg.to = null; leg.foldAt = now + rand(0, 110); }
  }
  const setPhase = (phase, now, ms) => { s.phase = phase; s.phaseUntil = now + ms; };

  function crawlTo(x, y, now = performance.now()) {
    s.now = now;
    s.target = { x: clamp(x, view.left + BODY_MARGIN, view.right - BODY_MARGIN), y: clamp(y, view.top + BODY_MARGIN, view.bottom - BODY_MARGIN) };
    s.marker = 1;
    if (!s.legsOut) popLegs(now);
    setPhase("think", now, rand(220, 480)); // considers it before moving
  }
  function moveBody(now, dt) {
    const dx = s.target.x - body.x, dy = s.target.y - body.y, dist = Math.hypot(dx, dy);
    const off = wrap(Math.atan2(dy, dx) - s.heading);
    if (dist < 1.5) {
      s.target = null; s.phase = "rest"; s.speed = 0; s.restingSince = now; s.wanderAt = now + rand(...WANDER);
      return;
    }
    if (s.phase === "think" && now > s.phaseUntil) setPhase("walk", now, rand(600, 1500));
    else if (s.phase === "walk" && now > s.phaseUntil && dist > 100) setPhase("think", now, rand(140, 400));
    const turnRate = s.phase === "walk" ? 4.2 : 0.8;
    s.heading += clamp(off, -turnRate * dt, turnRate * dt);
    const lined = Math.max(0.2, Math.cos(off));
    const wanted = s.phase === "walk" ? Math.min(WALK_SPEED, dist * 2.2 + 12) * lined : 0;
    s.speed += (wanted - s.speed) * Math.min(1, dt * 7);
    const lifted = s.legs.filter((l) => l.to).length, push = 1 - 0.35 * Math.min(1, lifted / 3);
    const step = Math.min(dist, s.speed * push * dt), dir = { x: dx / dist, y: dy / dist };
    s.travel = dir;
    body.x = clamp(body.x + dir.x * step, view.left + BODY_MARGIN, view.right - BODY_MARGIN);
    body.y = clamp(body.y + dir.y * step, view.top + BODY_MARGIN, view.bottom - BODY_MARGIN);
  }
  function startStep(leg, to, now) {
    leg.from = leg.foot; leg.to = to; leg.t0 = now; leg.stepMs = rand(110, 230);
    leg.bulge = Math.min(14, Math.hypot(to.x - leg.from.x, to.y - leg.from.y) * rand(0.08, 0.2)) * leg.side; // a slight arc
    leg.restless = rand(26, 72);
  }
  function moveLegs(now, dt) {
    const lead = s.speed * 0.25, stepping = s.legs.filter((l) => l.to), standing = !s.target || s.phase === "think";
    for (const leg of s.legs) {
      if (!leg.to) continue;
      const t = Math.min(1, (now - leg.t0) / leg.stepMs), e = t * t * (3 - 2 * t); // lift slowly, plant softly
      const dx = leg.to.x - leg.from.x, dy = leg.to.y - leg.from.y, len = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * t) * leg.bulge;
      leg.foot = { x: leg.from.x + dx * e - (dy / len) * arc, y: leg.from.y + dy * e + (dx / len) * arc };
      if (t === 1) { leg.foot = leg.to; leg.to = null; }
    }
    s.legs.filter((l) => !l.to).map((leg) => {
      const rest = restSpot(leg, lead), reach = Math.hypot(leg.foot.x - body.x, leg.foot.y - body.y);
      const lag = Math.hypot(rest.x - leg.foot.x, rest.y - leg.foot.y);
      const strained = reach > UPPER + LOWER - 6 || reach < REACH * 0.45;
      const fidget = standing && Math.random() < dt * 0.35; // shifts its weight now and then
      return { leg, lag, strained, wants: strained || lag > leg.restless || fidget };
    }).filter((c) => c.wants).sort((a, b) => b.lag - a.lag).forEach(({ leg, strained }) => {
      const neighbour = stepping.some((l) => l.side === leg.side && Math.abs(l.index - leg.index) === 1);
      if ((stepping.length >= 3 || neighbour) && !strained) return;
      startStep(leg, chooseFoothold(leg, lead), now);
      stepping.push(leg);
    });
  }

  function update(now) {
    const dt = s.last ? Math.min(0.05, Math.max(0, (now - s.last) / 1000)) : 0.016;
    s.last = now; s.now = now;
    if (!s.target && !s.legsOut && !s.folding && now > s.wanderAt && s.wanderAt) // off on its own
      crawlTo(rand(view.left + BODY_MARGIN, view.right - BODY_MARGIN), rand(view.top + BODY_MARGIN, view.bottom - BODY_MARGIN), now);
    if (!s.wanderAt) s.wanderAt = now + 900; // first stroll soon after it's first seen
    if (s.target) moveBody(now, dt);
    if (s.legsOut && !s.target && now - s.restingSince > REST_BEFORE_FOLD) foldLegs(now);
    if (s.legsOut) moveLegs(now, dt);
    if (stepPhysics(dt) && s.folding) s.folding = false;
    if (!s.target) s.marker = Math.max(0, s.marker - dt / 0.3);
    for (const leg of s.legs) if (!s.legsOut) { // strings go at the very end of the fold
      const t = (now - leg.foldAt - FOLD_MS * 0.7) / 120;
      leg.alpha = clamp(1 - t, 0, 1);
    }
  }

  function draw(canvas, now) {
    update(now);
    const ctx = canvas.getContext("2d"), k = canvas.width / VW, dot = Math.max(1, k);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    if (s.marker > 0 && s.target) { ctx.globalAlpha = s.marker; ctx.fillStyle = C.accent; ctx.fillRect(s.target.x - 2.5, s.target.y - 2.5, 5, 5); }
    ctx.globalAlpha = 1;
    // legs: strings like the navigation, shapes growing as they leave the body
    ctx.lineWidth = dot / k; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
    const size = (p) => clamp(Math.hypot(p.x - body.x, p.y - body.y) / SHAPE_FULL_AT, 0, 1);
    for (const leg of s.legs) {
      if (!leg.alpha) continue;
      ctx.globalAlpha = leg.alpha;
      ctx.beginPath(); ctx.moveTo(body.x, body.y); ctx.lineTo(leg.knee.x, leg.knee.y); ctx.lineTo(leg.footP.x, leg.footP.y); ctx.stroke();
      for (const [p, sh, slot] of [[leg.knee, leg.kneeShape, LEG_SLOT * 0.75], [leg.footP, leg.footShape, LEG_SLOT]]) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(size(p), size(p)); shape(ctx, sh, slot); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    // the body turns to face where it's going; its name walks with it
    ctx.save(); ctx.translate(body.x, body.y); ctx.rotate(s.heading + Math.PI / 2); ctx.fillStyle = C.accent; shape(ctx, s.bodyShape, BODY_SLOT); ctx.restore();
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `500 15px -apple-system, "Helvetica Neue", Arial, sans-serif`; ctx.fillStyle = C.ink; ctx.fillText("Niels Thejls", body.x, body.y + 41);
    ctx.font = `13px -apple-system, "Helvetica Neue", Arial, sans-serif`; ctx.fillStyle = C.muted; ctx.fillText("B. 1997", body.x, body.y + 56);
  }

  return { draw, crawlTo };
}
