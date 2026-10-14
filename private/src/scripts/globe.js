// The Biodiversity Hotspots globe, drawn live: the Hempel site's own dot renderer
// (look-again-3/src/scripts/globe-dots.ts), cut down to the one look it shipped with, so the
// thumbnail is transparent, sharp at any size, and ~80KB instead of a video.
// The dots were exported from that renderer: per dot an int16 x, y, z unit vector and a uint8
// hotspot weight (7 bytes). The per-dot scatter jitter was random there too, so it is re-made here.
const DOTS_URL = "/media/biodiversity-hotspots/globe-dots.bin";
const LOOK = {
  land: "rgba(10, 48, 27, 0.6)", hotspot: "#51ff99", sphere: "rgb(238, 235, 227)",
  landAlpha: 0.5, limbSize: 0.25, limbInset: 0.5, dotSize: 0.6, hotspotScatter: 0.0892,
  stepRad: (0.9 * Math.PI) / 180, tilt: (10 * Math.PI) / 180,
};
const TURN = 10; // seconds per revolution

let dots = null, loading = null;
function seeded(a) { // mulberry32: the same scatter on every visit
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function loadGlobe() {
  return (loading ??= fetch(DOTS_URL).then((r) => r.arrayBuffer()).then((buf) => {
    const dv = new DataView(buf), rnd = seeded(7);
    dots = Array.from({ length: buf.byteLength / 7 }, (_, i) => ({
      x: dv.getInt16(i * 7, true) / 32767, y: dv.getInt16(i * 7 + 2, true) / 32767, z: dv.getInt16(i * 7 + 4, true) / 32767,
      w: dv.getUint8(i * 7 + 6) / 255, j1: rnd() * 2 - 1, j2: rnd() * 2 - 1, ph: rnd() * Math.PI * 2,
    }));
  }));
}

// one frame into a canvas the globe fills, hotspots fully scattered, `t` in seconds
export function drawGlobe(canvas, t) {
  const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!dots) return;
  const dpr = devicePixelRatio || 1, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42, scatter = 1;
  const spin = (t / TURN) * Math.PI * 2, cs = Math.cos(spin), ss = Math.sin(spin), ct = Math.cos(LOOK.tilt), st = Math.sin(LOOK.tilt);
  const gap = R * LOOK.stepRad * LOOK.dotSize, baseR = Math.max(0.22 * dpr, gap * 0.34), hotR = Math.max(0.3 * dpr, gap * 0.44);
  const inset = LOOK.limbInset * dpr, hot = [];

  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fillStyle = LOOK.sphere; ctx.fill(); // the disc

  ctx.save(); // land dots, inside the disc's outline
  ctx.beginPath(); ctx.arc(cx, cy, R - inset, 0, 6.2832); ctx.clip();
  ctx.fillStyle = LOOK.land; ctx.globalAlpha = LOOK.landAlpha;
  for (const d of dots) {
    const x1 = d.x * cs + d.z * ss, z1 = -d.x * ss + d.z * cs, y2 = d.y * ct - z1 * st, z2 = d.y * st + z1 * ct;
    if (z2 <= 0) continue; // far side
    const sx = cx + x1 * R, sy = cy - y2 * R, fz = LOOK.limbSize + (1 - LOOK.limbSize) * Math.sqrt(z2);
    if (d.w > 0.02) hot.push([sx, sy, d, fz]);
    ctx.beginPath(); ctx.arc(sx, sy, baseR * fz, 0, 6.2832); ctx.fill();
  }
  ctx.restore();

  // hotspots, come loose from the sphere
  ctx.fillStyle = LOOK.hotspot;
  const reach = LOOK.hotspotScatter * R;
  for (const [sx, sy, d, fz] of hot) {
    const drift = scatter * reach * d.w, wob = Math.sin(t * 0.75 + d.ph), wob2 = Math.cos(t * 0.55 + d.ph * 1.7);
    ctx.beginPath();
    ctx.arc(sx + d.j1 * drift + wob * drift * 0.45, sy + d.j2 * drift + wob2 * drift * 0.45, hotR * (fz + (1 - fz) * scatter), 0, 6.2832);
    ctx.fill();
  }
}
