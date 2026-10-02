// Loading intro: "Niels Thejls" is written out left to right in the middle
// of the screen, each new character a flickering digit that then settles
// into its letter, like the numbers across the site (and the intro of the
// Instagram story). The dot of the "i" is one of the site's shapes: it
// flickers between square, circle and triangles while the name resolves,
// then settles on the shape the spider's body has this visit. It turns
// orange and grows, in place, into that body: the intro dissolves and the
// web grows out from exactly where the dot was.
//
// The "i" is set dotless (ı) and its dot is a separate shape placed where
// the font would draw it, so it can become the body. A click or key press
// skips straight to the site.
(function () {
  const html = document.documentElement;
  if (!html.classList.contains("intro")) return;

  const screen = document.getElementById("intro");
  const nameEl = screen.querySelector(".intro-name");
  const dot = screen.querySelector(".intro-dot");

  const NAME = "Niels Thejls";
  const I_AT = 1; // the "i" of Niels
  const WRITE_FROM = 400; // ms before the first character appears
  const WRITE_FOR = 900; // ms to write out and resolve the whole name
  const HOLD = 450; // ms the finished name rests before the dot lifts
  const GROW = 420; // ms for the dot to grow into the body, where it is
  const SHAPES = ["square", "circle", "up", "down"];
  const FLICKER = 70; // ms between the dot's random shapes

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // The name is pinned at the left edge of where the finished name sits, so
  // nothing written to the right of the "i" ever moves it.

  const finals = [...NAME].map((c, i) => (i === I_AT ? "ı" : c));
  nameEl.textContent = finals.join("");
  nameEl.style.width = `${nameEl.getBoundingClientRect().width}px`;
  nameEl.textContent = "";

  const digit = () => String(Math.floor(Math.random() * 10));
  const chars = finals.map((final) => {
    const span = document.createElement("span");
    nameEl.append(span);
    return { span, final };
  });
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  nameEl.append(probe);

  // Where the font puts the dot of an "i", from what's on screen: the
  // dotless i's own box (always laid out in the real font) and the baseline.
  // Measuring the font on a canvas looked exact but isn't: Safari's canvas
  // doesn't know -apple-system and measures a serif fallback instead, which
  // made the dot nearly twice too big on iPhones. Across the site's fonts
  // (SF, Helvetica Neue, Arial) the dot is ~54% of the i's advance, centred
  // on it, with its top ~0.72em above the baseline.
  const DOT_WIDTH = 0.54; // of the i's advance width
  const DOT_TOP = 0.72; // em above the baseline
  function dotBox() {
    const i = chars[I_AT].span.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(nameEl).fontSize);
    const side = i.width * DOT_WIDTH;
    return { x: i.left + (i.width - side) / 2, y: probe.getBoundingClientRect().top - DOT_TOP * em, side };
  }

  // the dot takes the same shape classes as the index list's icons
  function setShape(kind) {
    SHAPES.forEach((k) => dot.classList.toggle(`shape-${k}`, k === kind));
  }

  function place(box) {
    dot.style.width = dot.style.height = `${box.side}px`;
    dot.style.transform = `translate(${box.x}px, ${box.y}px)`;
  }

  let start = null;
  let from = null; // where the dot sits, and where the body will be
  let lastFlicker = -Infinity;
  let finished = false;

  function frame(now) {
    if (finished) return;
    if (start === null) start = now;
    const t = now - start;

    // the name: written out left to right, the writing a little ahead of
    // the resolving; characters not yet resolved flicker as digits
    const p = Math.min(1, Math.max(0, (t - WRITE_FROM) / WRITE_FOR));
    const shown = Math.ceil(chars.length * Math.min(1, p * 1.6));
    const resolved = Math.floor(chars.length * p);
    chars.forEach((c, i) => {
      if (i >= shown) c.span.textContent = "";
      else if (i < resolved || c.final === " ") c.span.textContent = c.final;
      else c.span.textContent = digit();
    });
    const allResolved = p === 1;
    const liftAt = WRITE_FROM + WRITE_FOR + HOLD;

    // the dot appears the moment its "i" resolves: everything to its left is
    // already a letter, so it never moves
    if (!from && resolved > I_AT) {
      from = dotBox();
      place(from);
      dot.style.opacity = 1;
    }

    // its shape flickers like the digits, then lands on the body's shape
    if (from && !allResolved && t - lastFlicker >= FLICKER) {
      lastFlicker = t;
      setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    } else if (allResolved) {
      setShape(SpiderWeb.bodyShape());
    }

    if (allResolved && t >= liftAt) {
      // the dot stays put: it turns orange and the spider's body is set
      // down right under it, then it grows to the body's size
      if (!nameEl.classList.contains("gone")) {
        nameEl.classList.add("gone");
        dot.classList.add("lifted");
        SpiderWeb.placeBody(from.x + from.side / 2, from.y + from.side / 2);
      }
      const body = SpiderWeb.bodyRect().width;
      const p = ease(Math.min(1, (t - liftAt) / GROW));
      const side = from.side + (body - from.side) * p;
      place({ x: from.x + (from.side - side) / 2, y: from.y + (from.side - side) / 2, side });
      if (p === 1) return finish();
    }
    requestAnimationFrame(frame);
  }

  // hand over: the intro dissolves onto the real body, and the web opens
  function finish() {
    if (finished) return;
    finished = true;
    screen.classList.add("done");
    html.classList.add("revealed");
    setTimeout(() => SpiderWeb.open(), 120);
    setTimeout(() => screen.remove(), 500);
  }

  screen.addEventListener("click", finish);
  window.addEventListener("keydown", finish, { once: true });
  requestAnimationFrame(frame);
})();
