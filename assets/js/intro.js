// Loading intro: "Niels Thejls" resolves out of random digits in the
// middle of the screen, like the numbers across the site. Then the dot of
// the "i" lifts off, turns orange and glides onto the spider's body, the
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
  const HOLD = 450; // ms the finished name rests before the dot lifts
  const GLIDE = 800; // ms for the dot to reach the body

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // one span per character; a zero-size probe marks the baseline
  const chars = [...NAME].map((c, i) => {
    const span = document.createElement("span");
    nameEl.append(span);
    return {
      span,
      final: i === I_AT ? "ı" : c,
      showAt: 80 + i * 35,
      resolveAt: 250 + i * 70 + rand(0, 250),
    };
  });
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  nameEl.append(probe);

  // Where the font puts the dot of an "i": the dotless i's stem gives the
  // width and centre, the dotted i's ink top gives the height
  function dotBox() {
    const cs = getComputedStyle(nameEl);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const stem = ctx.measureText("ı");
    const top = probe.getBoundingClientRect().top - ctx.measureText("i").actualBoundingBoxAscent;
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

    // the name: digits that settle into letters, left to right-ish
    let allResolved = true;
    chars.forEach((c) => {
      if (t < c.showAt) {
        c.span.textContent = "";
        allResolved = false;
      } else if (t < c.resolveAt) {
        c.span.textContent = c.final === " " ? " " : String(Math.floor(Math.random() * 10));
        allResolved = false;
      } else {
        c.span.textContent = c.final;
      }
    });

    const lastResolve = Math.max(...chars.map((c) => c.resolveAt));
    const liftAt = lastResolve + HOLD;

    // the dot appears the moment its i resolves, and sits on it while the
    // letters before it settle (digits and letters differ in width)
    if (t >= chars[I_AT].resolveAt && t < liftAt) {
      place(dotBox());
      dot.style.opacity = 1;
    }

    if (allResolved && t >= liftAt) {
      if (!from) {
        from = dotBox();
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
