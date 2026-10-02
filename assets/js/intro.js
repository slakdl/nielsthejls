// Loading intro: "Niels Thejls" is written out left to right in the middle
// of the screen, each new character a flickering digit that then settles
// into its letter, like the numbers across the site (and the intro of the
// Instagram story). Then the dot of the "i" lifts off, turns orange and glides onto the spider's body, the
// intro dissolves and the web opens from that square.
//
// The "i" is set dotless (ı) and its dot is a separate square placed exactly
// where the font would draw it, measured from the font itself, so it can
// leave. A click or key press skips straight to the site.
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
  const GLIDE = 800; // ms for the dot to reach the body

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // The name is pinned at the left edge of where the finished name sits, so
  // nothing written to the right of the "i" ever moves it.
  const font = getComputedStyle(nameEl);
  const measure = document.createElement("canvas").getContext("2d");
  measure.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;

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

  // Where the font puts the dot of an "i": the dotless i's stem gives the
  // width and centre, the dotted i's ink top gives the height
  function dotBox() {
    const stem = measure.measureText("ı");
    const top = probe.getBoundingClientRect().top - measure.measureText("i").actualBoundingBoxAscent;
    const left = chars[I_AT].span.getBoundingClientRect().left;
    const x0 = left - stem.actualBoundingBoxLeft;
    const side = stem.actualBoundingBoxRight + stem.actualBoundingBoxLeft;
    return { x: x0, y: top, side };
  }

  function place(box) {
    dot.style.width = dot.style.height = `${box.side}px`;
    dot.style.transform = `translate(${box.x}px, ${box.y}px)`;
  }

  let start = null;
  let from = null; // where the dot lifts off from
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
    // already a letter, so it stays put until it lifts off
    if (!from && resolved > I_AT) {
      from = dotBox();
      place(from);
      dot.style.opacity = 1;
    }

    if (allResolved && t >= liftAt) {
      if (!nameEl.classList.contains("gone")) {
        nameEl.classList.add("gone");
        dot.classList.add("lifted");
      }
      const to = SpiderWeb.bodyRect();
      const p = ease(Math.min(1, (t - liftAt) / GLIDE));
      place({
        x: from.x + (to.left - from.x) * p,
        y: from.y + (to.top - from.y) * p,
        side: from.side + (to.width - from.side) * p,
      });
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
