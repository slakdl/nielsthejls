// Loading intro: "Niels Thejls" stands in the middle of the screen as
// random digits from the first frame, and each digit turns into its letter
// in place, like the numbers across the site. Then the dot of
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

  // Digits keep their natural width and flicker until each lands on its
  // letter. The name is pinned at the left edge of where the finished name
  // sits, so letters settling to the right of the "i" never move it.
  const font = getComputedStyle(nameEl);
  const measure = document.createElement("canvas").getContext("2d");
  measure.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;

  const finals = [...NAME].map((c, i) => (i === I_AT ? "ı" : c));
  nameEl.textContent = finals.join("");
  nameEl.style.width = `${nameEl.getBoundingClientRect().width}px`;
  nameEl.textContent = "";

  const digit = () => String(Math.floor(Math.random() * 10));
  const chars = finals.map((final, i) => {
    const span = document.createElement("span");
    span.textContent = final === " " ? " " : digit();
    nameEl.append(span);
    return { span, final, resolveAt: 300 + i * 70 + rand(0, 300) };
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

    // the name: every digit keeps flickering until it turns
    // into its letter, roughly left to right
    let allResolved = true;
    chars.forEach((c) => {
      if (t < c.resolveAt) {
        if (c.final !== " ") c.span.textContent = digit();
        allResolved = false;
      } else {
        c.span.textContent = c.final;
      }
    });

    const lastResolve = Math.max(...chars.map((c) => c.resolveAt));
    const liftAt = lastResolve + HOLD;

    // the dot appears once the "N" and the "i" are both letters: nothing to
    // its left changes after that, so it stays put until it lifts off
    if (!from && chars.slice(0, I_AT + 1).every((c) => t >= c.resolveAt)) {
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
