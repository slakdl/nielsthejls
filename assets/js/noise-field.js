// Noise field: a generative "circuit" drawing that slowly fills the
// background whenever an open project has no media of its own.
//
// Orthogonal random walkers ("Manhattan walkers") move across a grid,
// steered by a value-noise density map so their traces gather into
// islands instead of covering the screen evenly. Walkers leave solid or
// dotted traces, step in staircases, branch, and drop chips (hatched
// rectangles with pins) and pads along the way. Everything is drawn with
// fillRect on whole pixels, so every corner stays sharp.
(function () {
  const CELL = 4; // grid pitch in CSS px
  const ISLAND = 0.56; // noise density above which walkers may travel
  const MAX_AGENTS = 160;
  const STEPS_PER_FRAME = 4;
  const SPAWN_FOR = 26000; // ms of new walkers before the drawing settles
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "noise-field";
  canvas.setAttribute("aria-hidden", "true");
  document.querySelector(".scene").prepend(canvas);
  const ctx = canvas.getContext("2d");

  let cols, rows, density, occupied, agents, raf, startedAt, clearTimer;
  let running = false;

  const rand = (n) => Math.floor(Math.random() * n);
  const at = (x, y) => y * cols + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows;

  // Smooth random lattice every `scale` cells, interpolated in between
  function valueNoise(scale) {
    const gw = Math.ceil(cols / scale) + 2;
    const g = Array.from({ length: gw * (Math.ceil(rows / scale) + 2) }, Math.random);
    const ease = (t) => t * t * (3 - 2 * t);
    const out = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ix = Math.floor(x / scale), iy = Math.floor(y / scale);
        const fx = ease(x / scale - ix), fy = ease(y / scale - iy);
        const a = g[iy * gw + ix], b = g[iy * gw + ix + 1];
        const c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
        out[at(x, y)] = a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
      }
    }
    return out;
  }

  // --- marks (all whole-pixel rectangles) ---
  function segment(x0, y0, x1, y1) {
    if (y0 === y1) ctx.fillRect(Math.min(x0, x1) * CELL, y0 * CELL, CELL + 1, 1);
    else ctx.fillRect(x0 * CELL, Math.min(y0, y1) * CELL, 1, CELL + 1);
  }
  const dot = (x, y) => ctx.fillRect(x * CELL, y * CELL, 1, 1);
  const pad = (x, y) => ctx.fillRect(x * CELL - 1, y * CELL - 1, 3, 3);

  // A chip: outlined rectangle, hatched inside, with pins that send
  // new walkers out from its edges
  function chip(x, y) {
    const w = 5 + rand(20), h = 3 + rand(8);
    if (!inside(x + w, y + h)) return;
    for (let j = y; j <= y + h; j++) for (let i = x; i <= x + w; i++) if (occupied[at(i, j)]) return;
    for (let j = y; j <= y + h; j++) for (let i = x; i <= x + w; i++) occupied[at(i, j)] = 1;

    const px = x * CELL, py = y * CELL, pw = w * CELL, ph = h * CELL;
    ctx.fillRect(px, py, pw + 1, 1);
    ctx.fillRect(px, py + ph, pw + 1, 1);
    ctx.fillRect(px, py, 1, ph + 1);
    ctx.fillRect(px + pw, py, 1, ph + 1);
    if (Math.random() < 0.6) {
      for (let j = 2; j < h; j += 2) ctx.fillRect(px + CELL, py + j * CELL, pw - 2 * CELL + 1, 1);
    } else {
      for (let i = 2; i < w; i += 2) ctx.fillRect(px + i * CELL, py + CELL, 1, ph - 2 * CELL + 1);
    }

    const pins = 2 + rand(5);
    for (let p = 0; p < pins; p++) {
      if (Math.random() < 0.5) {
        const i = x + 1 + rand(w - 1);
        Math.random() < 0.5 ? spawn(i, y, 3) : spawn(i, y + h, 1);
      } else {
        const j = y + 1 + rand(h - 1);
        Math.random() < 0.5 ? spawn(x, j, 2) : spawn(x + w, j, 0);
      }
    }
  }

  // --- walkers ---
  function spawn(x, y, dir) {
    if (agents.length >= MAX_AGENTS) return;
    const r = Math.random();
    const style = r < 0.5 ? "solid" : r < 0.8 ? "dotted" : "stair";
    agents.push({
      x, y, dir, style,
      n: 0,
      life: 15 + rand(170),
      stairDirs: [dir, (dir + (Math.random() < 0.5 ? 1 : 3)) % 4],
      stairEvery: 1 + rand(5),
      bridge: Math.random() < 0.05, // ignores the islands: long lines across empty space
    });
  }

  function seed() {
    for (let tries = 0; tries < 40; tries++) {
      const x = rand(cols), y = rand(rows);
      if (density[at(x, y)] > ISLAND && !occupied[at(x, y)]) {
        if (Math.random() < 0.15) chip(x, y);
        else spawn(x, y, rand(4));
        return;
      }
    }
  }

  // Advance one walker one cell; returns false when it's done
  function step(a) {
    if (a.style === "stair" && a.n % a.stairEvery === 0) {
      a.dir = a.stairDirs[(a.n / a.stairEvery) % 2];
    } else if (a.style !== "stair" && Math.random() < 0.07) {
      a.dir = (a.dir + (Math.random() < 0.5 ? 1 : 3)) % 4;
    }

    const nx = a.x + DIRS[a.dir][0], ny = a.y + DIRS[a.dir][1];
    if (!inside(nx, ny)) return false;
    const i = at(nx, ny);
    if (occupied[i]) {
      if (Math.random() < 0.5) return false;
      a.dir = (a.dir + (Math.random() < 0.5 ? 1 : 3)) % 4; // turn away instead of crossing
      return true;
    }
    if (!a.bridge && density[i] < ISLAND - 0.06) return false;

    a.n++;
    if (a.style === "dotted") {
      if (a.n % 2 === 0) dot(nx, ny);
    } else {
      segment(a.x, a.y, nx, ny);
    }
    occupied[i] = 1;
    a.x = nx;
    a.y = ny;

    if (Math.random() < 0.025) spawn(a.x, a.y, (a.dir + (Math.random() < 0.5 ? 1 : 3)) % 4);
    if (--a.life <= 0) {
      if (Math.random() < 0.35) pad(a.x, a.y);
      return false;
    }
    return true;
  }

  function tick(elapsed) {
    if (elapsed < SPAWN_FOR && Math.random() < 0.5) seed();
    for (let s = 0; s < STEPS_PER_FRAME; s++) agents = agents.filter(step);
    return agents.length > 0 || elapsed < SPAWN_FOR;
  }

  function frame(now) {
    if (!running) return;
    if (tick(now - startedAt)) raf = requestAnimationFrame(frame);
    else running = false;
  }

  function start() {
    stop(true);
    const w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--noise").trim() || "#a8a59c";

    cols = Math.ceil(w / CELL);
    rows = Math.ceil(h / CELL);
    const coarse = valueNoise(36), fine = valueNoise(9);
    density = coarse.map((v, i) => v * 0.75 + fine[i] * 0.25);
    occupied = new Uint8Array(cols * rows);
    agents = [];
    for (let i = 0; i < 10; i++) seed();

    canvas.classList.add("visible");
    running = true;
    startedAt = performance.now();
    if (reduceMotion) {
      // draw the finished pattern at once
      for (let t = 0; tick(t); t += 16);
      running = false;
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  function stop(immediate) {
    running = false;
    cancelAnimationFrame(raf);
    clearTimeout(clearTimer);
    if (immediate) return;
    canvas.classList.remove("visible");
    clearTimer = setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 500);
  }

  // A new viewport size gets a fresh pattern
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (canvas.classList.contains("visible")) start();
    }, 200);
  });

  window.NoiseField = { start, stop: () => stop(false) };
})();
