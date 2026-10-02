(function () {
  // Node shapes are drawn geometry (SVG / CSS / canvas), never font
  // glyphs: fonts and emoji fallbacks soften the corners of ■ ▪ ◼ ▲ ▼.
  // Squares and triangles keep sharp corners; circles are the only round
  // shape. `scale` is the size relative to the shape's slot.
  const SHAPES = [
    { kind: "square", scale: 1 },
    { kind: "square", scale: 0.75 },
    { kind: "square", scale: 0.5 },
    { kind: "circle", scale: 1 },
    { kind: "up", scale: 1 },
    { kind: "down", scale: 1 },
  ];
  function randomShape() {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }
  // Triangle points inside a box of side `a` centred on (cx, cy)
  function trianglePoints(kind, a, cx = 0, cy = 0) {
    const h = a / 2;
    return kind === "up"
      ? [[cx, cy - h], [cx + h, cy + h], [cx - h, cy + h]]
      : [[cx - h, cy - h], [cx + h, cy - h], [cx, cy + h]];
  }
  function shapeSpan(sel, shape) {
    const a = Math.round(11 * shape.scale);
    sel.append("span").attr("class", `shape shape-${shape.kind}`).style("width", `${a}px`).style("height", `${a}px`);
  }
  function drawShape(g, shape, slot) {
    const a = Math.round(slot * shape.scale);
    if (shape.kind === "square") {
      return g.append("rect").attr("x", -a / 2).attr("y", -a / 2).attr("width", a).attr("height", a);
    }
    if (shape.kind === "circle") return g.append("circle").attr("r", a / 2);
    return g.append("polygon").attr("points", trianglePoints(shape.kind, a).map((p) => p.join(",")).join(" "));
  }

  // Placeholder copy: every digit is re-rolled on each load, keeping the
  // length and punctuation of each string so the layout stays the same.
  function scramble(str) {
    return str.replace(/\d/g, () => Math.floor(Math.random() * 10));
  }
  const UI = {
    index: scramble("05482"),
    page: scramble("5193"),
    project: scramble("0915472"),
    placeholder: scramble("77401639285"),
    details: scramble("6038172"),
    connections: scramble("94016257318"),
    madeWith: scramble("2148 6170"),
  };

  // The favicon is drawn from the same glyph pool as the string
  // navigation, picked fresh on every load — same randomizer, just
  // rendered to a canvas instead of an SVG node.
  (function setFavicon() {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f5f4ef";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#1a1a1a";
    const shape = randomShape();
    const a = Math.round(40 * shape.scale);
    if (shape.kind === "square") {
      ctx.fillRect((size - a) / 2, (size - a) / 2, a, a);
    } else {
      ctx.beginPath();
      if (shape.kind === "circle") ctx.arc(size / 2, size / 2, a / 2, 0, Math.PI * 2);
      else trianglePoints(shape.kind, a, size / 2, size / 2).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.fill();
    }

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  })();

  const folders = [
    {
      id: "client-work",
      label: "313236 5733",
      description: "06420691 355490 99037383.",
      items: [1, 2, 3, 4, 5].map((n) => ({
        id: `client-${n}`,
        kind: "project",
        label: "00000 000000",
        subtitle: "000000 0000",
        meta: "000000 · 0000",
        tags: "0000 · 0000000 · 00000 · 000000000",
        body: "0000000 00 0000 0000000 000 00000000 000 0000000 00 000000.\n\n00 00000 00000 000000 0000000 0000 0000 000 0000000 00000.",
        related: [`client-${(n % 5) + 1}`, `client-${((n + 1) % 5) + 1}`],
      })),
    },
    {
      id: "archive-work",
      label: "5147125 4589",
      body: "0 4822196158 77 13158135620, 7646543, 02230 508 210440 9090355.\n\n589 4774399 68 09409 0 9901029 342125 8999152 55161536682 8071048 51627 2242'06 57592. 8236862408, 834551, 54740-993422, 7984, 34152043, 21434404151 339 7588955769 83 1687583.\n\n1620 983 15728680. 0314 908 081. 2013 3556 7304 02 42508 1 6840676, 159007 78 261548 930.\n\n055574, 8727 55 2019 6 26367 37 718820 535918445.",
      items: [],
    },
    {
      id: "bio",
      label: "779",
      photo: "assets/Niels_Pas_Wide_compressed.png",
      body: "6'7 67846, 9 600576 68896221 3865805 116201 20607, 4449433 625 733121.\n\n2 4010 297406003 745 366995 2572, 3034432 84949437353 5835542 51386540119 117 669134031.",
      resumeSections: [
        {
          title: "Experience",
          entries: [
            { org: "Spring/Summer", role: "Junior Designer", years: "2026 – Present" },
            { org: "Re-Public", role: "Internship", years: "2026" },
            { org: "Stupid Studio", role: "Freelance", years: "2025 – Present" },
            { org: "Stupid Studio", role: "Internship", years: "2024 – 2025" },
            { org: "Dwarf", role: "Internship", years: "2022" },
          ],
        },
        {
          title: "Education",
          entries: [
            { org: "Toronto Metropolitan University", role: "Scholarship | Digital Publishing", years: "2025" },
            { org: "Danmarks Medie- og Journalisthøjskole", role: "Bachelor Degree | Interactive Design", years: "2022 – 2025" },
            { org: "Københavns Erhvervsakademi", role: "Academy Degree | Entrepreneurship & Design", years: "2020 – 2022" },
            { org: "Fontys Academy for Creative Industries", role: "Minor | Transmedia Design", years: "2021" },
          ],
        },
        {
          title: "Recognition",
          entries: [
            { org: "The Green Hand", role: "Graphite Pencil — D&AD New Blood Awards", url: "https://www.dandad.org/work/new-blood-archive/the-green-hand" },
          ],
        },
      ],
      media: [{ type: "image", src: "assets/projects/bio/portrait.jpg", aspect: 2480 / 3485 }],
      externalLinks: [
        { id: "bio-recognition", label: "Recognition", url: "https://www.dandad.org/work/new-blood-archive/the-green-hand" },
      ],
      items: [],
    },
  ];

  folders.forEach((f) => {
    f.label = scramble(f.label);
    if (f.body) f.body = scramble(f.body);
    f.shape = randomShape();
    if (f.description) f.description = scramble(f.description);
    f.items.forEach((it) => {
      ["label", "subtitle", "meta", "tags", "body"].forEach((k) => {
        if (it[k]) it[k] = scramble(it[k]);
      });
      it.shape = randomShape();
    });
    (f.externalLinks || []).forEach((lnk) => {
      lnk.shape = randomShape();
    });
  });

  // Persistent node objects — built once so a node keeps its position (and
  // the simulation keeps its momentum) across every reveal/hide cycle,
  // instead of resetting each time it re-enters the graph.
  const rootNode = { id: "root", type: "root", label: "Niels Thejls", sub: "B. 1997", shape: randomShape() };
  const folderNodes = new Map();
  const itemNodes = new Map();
  const linkNodes = new Map();
  folders.forEach((f) => {
    folderNodes.set(f.id, { id: f.id, type: "folder", label: f.label, shape: f.shape, hasItems: f.items.length > 0 });
    f.items.forEach((it) => {
      itemNodes.set(it.id, { id: it.id, type: "item", label: it.label, shape: it.shape, folderId: f.id, item: it });
    });
    (f.externalLinks || []).forEach((lnk) => {
      linkNodes.set(lnk.id, { id: lnk.id, type: "link", label: lnk.label, shape: lnk.shape, url: lnk.url, folderId: f.id });
    });
  });

  const svg = d3.select("#graph");
  const legLayer = svg.append("g").attr("class", "legs");
  const linkLayer = svg.append("g").attr("class", "links");
  const nodeLayer = svg.append("g").attr("class", "nodes");

  const radius = (d) => (d.type === "root" ? 22 : d.type === "folder" ? 18 : 14);
  const fontSize = (d) => (d.type === "root" ? 34 : d.type === "folder" ? 28 : 22);

  // The graph is clamped to x <= width - GRAPH_SAFE_MARGIN, so media is
  // kept entirely to the right of that same line — the two can never
  // occupy the same horizontal territory, not just visually resolved
  // after the fact.
  const GRAPH_SAFE_MARGIN = 480;

  // Everything in the web (nodes, spider legs) stays inside the viewport
  // and left of the panel line. The bottom edge leaves room for labels.
  const VIEW_PAD = 24;
  const LABEL_ROOM = 44;
  function viewBounds() {
    return { left: VIEW_PAD, top: VIEW_PAD, right: width - GRAPH_SAFE_MARGIN, bottom: height - LABEL_ROOM };
  }
  function keepInView(p) {
    const v = viewBounds();
    return { x: Math.min(Math.max(p.x, v.left), v.right), y: Math.min(Math.max(p.y, v.top), v.bottom) };
  }

  let width = window.innerWidth;
  let height = window.innerHeight;

  let linkSel = linkLayer.selectAll("path");
  let nodeSel = nodeLayer.selectAll("g");

  const simulation = d3
    .forceSimulation([rootNode])
    .force(
      "link",
      d3
        .forceLink([])
        .id((d) => d.id)
        .distance((d) => d.distance ?? (d.source.type === "root" ? 140 : 90))
        .strength(0.9)
    )
    .force("charge", d3.forceManyBody().strength(-260))
    .force(
      "collide",
      d3.forceCollide().radius((d) => radius(d) + 26)
    )
    .force("x", d3.forceX(() => rootNode.fx + width * 0.04).strength(0.045))
    .force("y", d3.forceY(() => rootNode.fy + height * 0.01).strength(0.06))
    .on("tick", ticked);

  function anchorRoot() {
    rootNode.fx = width * 0.3;
    rootNode.fy = height * 0.49;
  }
  anchorRoot();
  rootNode.x = rootNode.fx;
  rootNode.y = rootNode.fy;

  function ticked() {
    simulation.nodes().forEach((d) => {
      if (d.type === "root") return;
      const p = keepInView(d);
      d.x = p.x;
      d.y = p.y;
    });
    linkSel.attr("d", (d) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
    nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
    updateMediaOverlap();
  }

  // The graph always paints above the media rail (so the string nav is
  // never covered), which also means a plain CSS mix-blend-mode can't
  // reach across to the video/image underneath it — the two live in
  // separate stacking contexts on purpose. Instead: detect the overlap in
  // JS and self-invert just that glyph's own colors, which reads the same
  // as the KOBEN logo/text invert rule without needing that blend.
  function updateMediaOverlap() {
    if (!mediaRail.classed("visible")) {
      nodeSel.classed("on-media", false);
      return;
    }
    const rects = mediaRail
      .selectAll(".rail-item")
      .nodes()
      .map((n) => n.getBoundingClientRect());
    nodeSel.classed("on-media", (d) => {
      const r = radius(d);
      return rects.some((rect) => d.x + r > rect.left && d.x - r < rect.right && d.y + r > rect.top && d.y - r < rect.bottom);
    });
  }

  function drag() {
    function started(event, d) {
      if (d.type === "root") return;
      if (!event.active) simulation.alphaTarget(0.15).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      if (d.type === "root") return;
      d.fx = event.x;
      d.fy = event.y;
    }
    function ended(event, d) {
      if (d.type === "root") return;
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag().on("start", started).on("drag", dragged).on("end", ended);
  }

  // --- progressive reveal state: the graph starts with only the root
  // square visible, and grows a branch at a time as you click through it. ---
  let rootOpen = true;
  let openFolderId = null;

  function buildNode(g, d) {
    drawShape(g, d.shape, fontSize(d) * 0.62).attr("class", "node-shape");

    g.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("y", radius(d) + (d.type === "root" ? 19 : 16))
      .text(d.label);

    if (d.type === "root") {
      g.append("text")
        .attr("class", "node-sublabel")
        .attr("text-anchor", "middle")
        .attr("y", radius(d) + 34)
        .text(d.sub);
    }
  }

  function updateGraph() {
    const activeNodes = [rootNode];
    const activeLinks = [];

    if (rootOpen) {
      folders.forEach((f) => {
        const fn = folderNodes.get(f.id);
        activeNodes.push(fn);
        activeLinks.push({ source: "root", target: f.id, muted: false });
        if (openFolderId === f.id) {
          // varied per-link so a folder's children don't all sit in a
          // uniform ring around it — re-rolled fresh each time it opens
          f.items.forEach((it) => {
            const itn = itemNodes.get(it.id);
            activeNodes.push(itn);
            activeLinks.push({ source: f.id, target: it.id, muted: it.kind === "placeholder", distance: 60 + Math.random() * 110 });
          });
          (f.externalLinks || []).forEach((lnk) => {
            const ln = linkNodes.get(lnk.id);
            activeNodes.push(ln);
            activeLinks.push({ source: f.id, target: lnk.id, muted: false, distance: 60 + Math.random() * 110 });
          });
        }
      });
    }

    // seed a brand-new node near its parent's current position so it
    // visibly grows outward from there, instead of popping in at (0,0)
    activeNodes.forEach((d) => {
      if (d.x === undefined) {
        const parent = d.type === "folder" ? rootNode : d.type === "item" || d.type === "link" ? folderNodes.get(d.folderId) : null;
        const px = parent ? parent.x : width * 0.3;
        const py = parent ? parent.y : height * 0.49;
        d.x = px + (Math.random() - 0.5) * 6;
        d.y = py + (Math.random() - 0.5) * 6;
      }
    });

    simulation.nodes(activeNodes);
    simulation.force("link").links(activeLinks);

    linkSel = linkLayer
      .selectAll("path")
      .data(activeLinks, (d) => `${d.source.id || d.source}->${d.target.id || d.target}`)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", (d) => "link" + (d.muted ? " muted" : ""))
            .attr("opacity", 0)
            .call((e) => e.transition().duration(350).attr("opacity", 1)),
        (update) => update.attr("class", (d) => "link" + (d.muted ? " muted" : "")),
        (exit) => exit.remove()
      );

    nodeSel = nodeLayer
      .selectAll("g")
      .data(activeNodes, (d) => d.id)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr(
              "class",
              (d) => "node " + (d.type === "link" ? "ext-link" : d.type) + (d.type === "item" && d.item.kind === "placeholder" ? " muted" : "")
            )
            .attr("opacity", 0)
            .call(drag())
            .on("click", (event, d) => {
              if (d.type === "root") toggleRoot();
              else if (d.type === "folder") d.hasItems ? toggleFolder(d.id) : openFolderPage(d.id);
              else if (d.type === "link") window.open(d.url, "_blank", "noopener,noreferrer");
              else openProject(d.folderId, d.id);
            });
          g.each(function (d) {
            buildNode(d3.select(this), d);
          });
          g.transition().duration(350).attr("opacity", 1);
          return g;
        },
        (update) => update,
        (exit) => exit.remove()
      );

    simulation.alpha(0.9).restart();
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    if (spider.moved) {
      const p = keepInView({ x: rootNode.fx, y: rootNode.fy });
      rootNode.fx = p.x;
      rootNode.fy = p.y;
    } else {
      anchorRoot();
    }
    simulation.alpha(0.3).restart();
  }

  // --- spider: click empty space and the web grows legs and stalks there ---
  //
  // Procedural walk: each leg has a planted foot. As the body moves, a leg
  // whose foot falls behind its resting spot steps forward. Each leg is two
  // strings like the navigation ones, a random shape at the knee and another
  // at the foot, no labels. The bug hunts rather than walks: it turns to face
  // the click, creeps in short bursts with freezes in between, stepping one or
  // two legs at a time, then pounces with a fast alternating gait once it's
  // close. Legs pop out like the project nodes do: they start at the body and
  // are pulled into place by the same kind of spring the force graph uses
  // (velocity decay 0.4), fading in over the same 350ms. They fold back the
  // same way once it has rested a while.
  const spider = (() => {
    const HIP_ANGLES = [34, 68, 112, 148]; // degrees from the heading, front to back
    const UPPER = 78, LOWER = 96; // leg segment lengths
    const REACH = 128; // body to resting foot
    const STEP_AT = 46; // how far a foot may lag before it steps
    const CREEP_SPEED = 100; // px per second
    const POUNCE_SPEED = 520;
    const POUNCE_RANGE = 160; // close enough to strike
    const REST_BEFORE_FOLD = 2600; // ms
    const BODY_MARGIN = 70; // keeps the body far enough in for its legs
    const SPRING = 0.2; // pull toward the target position per 60fps tick
    const VELOCITY_DECAY = 0.4; // same as d3's force simulation

    const state = {
      moved: false,
      target: null,
      phase: "rest", // turn | creep | freeze | pounce | rest
      phaseUntil: 0,
      heading: -Math.PI / 2, // facing up to start
      speed: 0,
      legsOut: false,
      restingSince: 0,
      legs: [],
      lastTime: 0,
      running: false,
    };

    [-1, 1].forEach((side) => {
      HIP_ANGLES.forEach((deg, i) => {
        state.legs.push({
          side,
          index: i,
          front: i < 2,
          angle: (side * deg * Math.PI) / 180,
          group: (i + (side > 0 ? 1 : 0)) % 2,
          foot: null,
          from: null,
          to: null,
          t0: 0,
          stepMs: 0,
          // what's drawn: springs toward the walking positions
          shown: { knee: { x: 0, y: 0, vx: 0, vy: 0 }, foot: { x: 0, y: 0, vx: 0, vy: 0 } },
        });
      });
    });

    const slot = fontSize({ type: "item" }) * 0.62;
    const legSel = legLayer.selectAll("g").data(state.legs).join("g").attr("class", "leg").attr("opacity", 0);
    legSel.append("path").attr("class", "link");
    legSel.each(function () {
      const g = d3.select(this);
      drawShape(g.append("g").attr("class", "leg-knee"), randomShape(), slot * 0.75).attr("class", "node-shape");
      drawShape(g.append("g").attr("class", "leg-foot"), randomShape(), slot).attr("class", "node-shape");
    });
    const marker = legLayer.append("rect").attr("class", "spider-target").attr("width", 5).attr("height", 5).attr("opacity", 0);

    const body = () => ({ x: rootNode.fx, y: rootNode.fy });
    const dirAt = (a) => ({ x: Math.cos(a), y: Math.sin(a) });
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

    function restSpot(leg, lead) {
      const b = body(), d = dirAt(state.heading + leg.angle), v = dirAt(state.heading);
      return keepInView({ x: b.x + d.x * REACH + v.x * lead, y: b.y + d.y * REACH + v.y * lead });
    }

    // Two-segment IK from the body to the foot; front knees point forward,
    // back knees backward, mirrored left and right like a spider's spread
    function knee(leg) {
      const b = body(), f = leg.foot;
      const dx = f.x - b.x, dy = f.y - b.y;
      const d = clamp(Math.hypot(dx, dy), 1, UPPER + LOWER - 0.5);
      const a = Math.acos(clamp((UPPER * UPPER + d * d - LOWER * LOWER) / (2 * UPPER * d), -1, 1));
      const base = Math.atan2(dy, dx), v = dirAt(state.heading);
      const k1 = { x: b.x + Math.cos(base + a) * UPPER, y: b.y + Math.sin(base + a) * UPPER };
      const k2 = { x: b.x + Math.cos(base - a) * UPPER, y: b.y + Math.sin(base - a) * UPPER };
      const ahead = (k) => (k.x - b.x) * v.x + (k.y - b.y) * v.y;
      return keepInView(ahead(k1) > ahead(k2) === leg.front ? k1 : k2);
    }

    // Like a new project node: start at the body, nudged a few px at random,
    // and let the spring throw it out to its place
    function popLegs() {
      const b = body();
      state.legsOut = true;
      state.legs.forEach((leg) => {
        leg.foot = restSpot(leg, 0);
        leg.to = null;
        [leg.shown.knee, leg.shown.foot].forEach((p) => {
          p.x = b.x + (Math.random() - 0.5) * 6;
          p.y = b.y + (Math.random() - 0.5) * 6;
          p.vx = p.vy = 0;
        });
      });
      legSel.interrupt().attr("opacity", 0).transition().duration(350).attr("opacity", 1);
    }

    function foldLegs() {
      state.legsOut = false;
      legSel.interrupt().transition().duration(350).attr("opacity", 0);
    }

    // Spring each drawn point toward where the leg wants it (or back into the
    // body when folding). Returns true once everything has settled.
    function springLegs(dt) {
      const b = body();
      const ticks = Math.max(1, Math.round(dt * 60));
      let settled = true;
      state.legs.forEach((leg) => {
        const goals = state.legsOut ? { knee: knee(leg), foot: leg.foot } : { knee: b, foot: b };
        ["knee", "foot"].forEach((part) => {
          const p = leg.shown[part], g = goals[part];
          for (let i = 0; i < ticks; i++) {
            p.vx = (p.vx + (g.x - p.x) * SPRING) * (1 - VELOCITY_DECAY);
            p.vy = (p.vy + (g.y - p.y) * SPRING) * (1 - VELOCITY_DECAY);
            p.x += p.vx;
            p.y += p.vy;
          }
          if (Math.abs(g.x - p.x) + Math.abs(g.y - p.y) > 0.5 || Math.abs(p.vx) + Math.abs(p.vy) > 0.05) settled = false;
        });
      });
      return settled;
    }

    function setPhase(phase, now, ms) {
      state.phase = phase;
      state.phaseUntil = now + ms;
    }

    function crawlTo(x, y) {
      const v = viewBounds();
      state.target = {
        x: clamp(x, v.left + BODY_MARGIN, v.right - BODY_MARGIN),
        y: clamp(y, v.top + BODY_MARGIN, v.bottom - BODY_MARGIN),
      };
      state.moved = true;
      if (!state.legsOut) popLegs();
      marker.interrupt().attr("x", state.target.x - 2.5).attr("y", state.target.y - 2.5).attr("opacity", 1);
      // a brief freeze first: it has noticed something
      setPhase("freeze", performance.now(), 120 + Math.random() * 180);
      simulation.alphaTarget(0.2).restart();
      if (!state.running) {
        state.running = true;
        state.lastTime = performance.now();
        requestAnimationFrame(frame);
      }
    }

    function moveBody(now, dt) {
      const dx = state.target.x - rootNode.fx, dy = state.target.y - rootNode.fy;
      const dist = Math.hypot(dx, dy);
      const off = wrap(Math.atan2(dy, dx) - state.heading);
      const facing = Math.abs(off) < 0.2;

      if (dist < 2) {
        state.target = null;
        state.phase = "rest";
        state.speed = 0;
        state.restingSince = now;
        marker.transition().duration(300).attr("opacity", 0);
        simulation.alphaTarget(0);
        return;
      }

      // decide what to do next
      if (state.phase !== "pounce") {
        if (dist < POUNCE_RANGE && facing && state.phase !== "freeze") setPhase("pounce", now, Infinity);
        else if (state.phase === "creep" && Math.abs(off) > 0.7) setPhase("turn", now, Infinity);
        else if (state.phase === "turn" && facing) setPhase("creep", now, 400 + Math.random() * 900);
        else if (now > state.phaseUntil) {
          if (state.phase === "creep") setPhase("freeze", now, 120 + Math.random() * 380);
          else setPhase(facing ? "creep" : "turn", now, 400 + Math.random() * 900);
        }
      }

      // turn rate and speed per phase
      const turnRate = { turn: 4, creep: 2.2, freeze: 0, pounce: 10 }[state.phase];
      const wanted = { turn: 0, creep: CREEP_SPEED, freeze: 0, pounce: Math.min(POUNCE_SPEED, dist * 7) }[state.phase];
      state.heading += clamp(off, -turnRate * dt, turnRate * dt);
      if (state.phase === "freeze" && Math.random() < dt * 1.5) state.heading += (Math.random() - 0.5) * 0.12; // twitch
      state.speed += (wanted - state.speed) * Math.min(1, dt * (state.phase === "pounce" ? 16 : 9));

      // creep along the heading; the pounce goes straight for the target
      const step = Math.min(dist, state.speed * dt);
      const dir = state.phase === "pounce" ? { x: dx / dist, y: dy / dist } : dirAt(state.heading);
      const v = viewBounds();
      rootNode.fx = clamp(rootNode.fx + dir.x * step, v.left + BODY_MARGIN, v.right - BODY_MARGIN);
      rootNode.fy = clamp(rootNode.fy + dir.y * step, v.top + BODY_MARGIN, v.bottom - BODY_MARGIN);

      // forceX/forceY cache their targets, so re-read them as the body moves
      simulation.force("x").x(simulation.force("x").x());
      simulation.force("y").y(simulation.force("y").y());
    }

    // Creeping: a wave gait, at most two legs up and never two neighbours on
    // one side. Pouncing: two alternating groups, fast.
    function moveLegs(now) {
      const pouncing = state.phase === "pounce";
      const lead = state.speed * 0.25;
      const stepping = state.legs.filter((l) => l.to);

      state.legs.forEach((leg) => {
        if (!leg.to) return;
        const t = Math.min(1, (now - leg.t0) / leg.stepMs);
        const e = t * t * (3 - 2 * t); // lift slowly, plant softly
        leg.foot = { x: leg.from.x + (leg.to.x - leg.from.x) * e, y: leg.from.y + (leg.to.y - leg.from.y) * e };
        if (t === 1) leg.to = null;
      });

      state.legs
        .filter((l) => !l.to)
        .map((leg) => {
          const spot = restSpot(leg, lead);
          return { leg, spot, lag: Math.hypot(spot.x - leg.foot.x, spot.y - leg.foot.y) };
        })
        .filter((c) => c.lag > STEP_AT)
        .sort((a, b) => b.lag - a.lag)
        .forEach(({ leg, spot, lag }) => {
          const desperate = lag > STEP_AT * 2.2;
          let allowed;
          if (pouncing) {
            allowed = !stepping.some((l) => l.group !== leg.group);
          } else {
            const neighbour = stepping.some((l) => l.side === leg.side && Math.abs(l.index - leg.index) === 1);
            allowed = stepping.length < 2 && !neighbour;
          }
          if (!allowed && !desperate) return;
          leg.from = leg.foot;
          leg.to = spot;
          leg.t0 = now;
          leg.stepMs = pouncing ? 60 : 120;
          stepping.push(leg);
        });
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      if (state.target) moveBody(now, dt);

      // fold away after a long rest
      if (state.legsOut && !state.target && now - state.restingSince > REST_BEFORE_FOLD) foldLegs();

      if (state.legsOut) moveLegs(now);
      const settled = springLegs(dt);
      draw();

      if (state.target || state.legsOut || !settled || state.legs.some((l) => l.to)) {
        requestAnimationFrame(frame);
      } else {
        state.running = false;
      }
    }

    function draw() {
      const b = body();
      legSel.each(function (leg) {
        const k = leg.shown.knee, f = leg.shown.foot;
        const el = d3.select(this);
        el.select("path").attr("d", `M${b.x},${b.y}L${k.x},${k.y}L${f.x},${f.y}`);
        el.select(".leg-knee").attr("transform", `translate(${k.x},${k.y})`);
        el.select(".leg-foot").attr("transform", `translate(${f.x},${f.y})`);
      });
      // the body shape turns to face where it's going
      nodeSel
        .filter((d) => d.type === "root")
        .select(".node-shape")
        .attr("transform", `rotate(${(state.heading * 180) / Math.PI + 90})`);
    }

    // clicks on empty page space only: not the panel, nodes, media or lightbox
    document.addEventListener("click", (event) => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) return;
      if (event.target.closest(".panel, .node, .rail-item, .lightbox, a, button")) return;
      crawlTo(event.clientX, event.clientY);
    });

    return state;
  })();

  window.addEventListener("resize", resize);
  resize();

  // --- right-hand panel ---
  const panelBody = d3.select("#panel-body");
  const mediaRail = d3.select("#media-rail");
  const lightbox = d3.select("#lightbox");

  function openLightbox(src) {
    lightbox.html("");
    const video = lightbox.append("video").attr("src", src).attr("controls", true).attr("playsinline", true).node();
    // Explicit, unmuted .play() — called synchronously inside this click
    // handler so the browser counts it as a real user gesture and allows
    // sound. The `autoplay` attribute alone gets silently downgraded to
    // muted by most browsers' autoplay policy, which was the bug.
    video.muted = false;
    video.play().catch(() => {});
    lightbox.append("button").attr("class", "lightbox-close").html("&times;").on("click", closeLightbox);
    lightbox.on("click", (event) => {
      if (event.target === lightbox.node()) closeLightbox();
    });
    lightbox.classed("visible", true);
  }

  function closeLightbox() {
    lightbox.classed("visible", false);
    lightbox.html("");
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classed("visible")) closeLightbox();
  });

  function setActiveFolder(folderId) {
    nodeSel.classed("active", (d) => d.type === "folder" && d.id === folderId);
  }

  function toggleRoot() {
    rootOpen = !rootOpen;
    openFolderId = null;
    updateGraph();
    renderIndex(null);
  }

  function toggleFolder(folderId) {
    rootOpen = true;
    openFolderId = openFolderId === folderId ? null : folderId;
    updateGraph();
    renderIndex(openFolderId);
    setActiveFolder(openFolderId);
  }

  function renderIndex(openId) {
    NoiseField.stop();
    mediaRail.classed("visible", false).html("");
    updateMediaOverlap();
    nodeSel.classed("selected", false);

    const list = panelBody.html("").append("ul").attr("class", "folder-list");

    list
      .selectAll("li")
      .data(folders)
      .join("li")
      .each(function (f) {
        const li = d3.select(this);

        const hasItems = f.items.length > 0;

        const row = li
          .append("div")
          .attr("class", "folder-row" + (f.id === openId ? " open" : ""))
          .attr("data-id", f.id);
        row.append("span").attr("class", "folder-icon").call(shapeSpan, f.shape);
        row.append("span").attr("class", "folder-label").text(f.label);
        row.append("span").attr("class", "folder-toggle").text(hasItems ? "+" : "→");

        if (hasItems) {
          const content = li.append("div").attr("class", "folder-content");
          content.append("p").text(f.description);
          const ul = content.append("ul");
          const itemLi = ul.selectAll("li").data(f.items).join("li").append("a").attr("href", "#");
          itemLi.append("span").attr("class", "item-icon").each(function (d) {
            shapeSpan(d3.select(this), d.shape);
          });
          itemLi.append("span").text((d) => d.label);
          itemLi.on("click", (event, d) => {
            event.preventDefault();
            openProject(f.id, d.id);
          });

          row.on("click", () => toggleFolder(f.id));
        } else {
          row.on("click", () => openFolderPage(f.id));
        }
      });
  }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Scattered fresh every time a project opens, but never blindly: each
  // item's exact box size is known upfront (from its real aspect ratio,
  // not the browser's async-loaded intrinsic size), so a candidate
  // position can be scored before it's ever placed. Up to 60 random
  // candidates are tried per item and the one with the least coverage
  // wins — the goal is that no item is ever covered more than 25% by
  // either the panel or another already-placed item.
  const ITEM_MAX_HEIGHT_VH = 28;
  const MEDIA_MAX_WIDTH = 400; // must match the CSS max-width on .media-rail video/img
  const MAX_COVER_FRACTION = 0.25;
  const PLACEMENT_ATTEMPTS = 60;

  function randomRight() {
    // Two loose zones for spread — a strip right at the viewport edge,
    // and a wider band reaching toward (and a little past) the graph's
    // safe line.
    return Math.random() < 0.4 ? 10 + Math.random() * 110 : 90 + Math.random() * (GRAPH_SAFE_MARGIN + 80 - 90);
  }

  function rectAt(right, top, w, h) {
    const x2 = width - right;
    return { left: x2 - w, right: x2, top, bottom: top + h };
  }

  function coverFraction(a, b) {
    const ow = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const oh = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const area = (a.right - a.left) * (a.bottom - a.top);
    return area > 0 ? (ow * oh) / area : 0;
  }

  const MOBILE_BREAKPOINT = 860; // must match the CSS breakpoint

  // On mobile there's no open canvas to scatter across (the string nav is
  // hidden entirely), so media is just appended in-flow below the project
  // text instead — no positioning math needed, normal document flow.
  function renderMobileMedia(item) {
    mediaRail.classed("visible", false).html("");
    updateMediaOverlap();

    const view = panelBody.select(".project-view");
    view.selectAll(".mobile-media").remove();
    if (!item.media || !item.media.length) return;

    const gallery = view.append("div").attr("class", "mobile-media");
    shuffled(item.media).forEach((m) => {
      const wrap = gallery.append("div").attr("class", "mobile-media-item" + (m.lightbox ? " openable" : ""));
      if (m.lightbox) wrap.on("click", () => openLightbox(m.lightboxSrc || m.src));
      if (m.type === "video") {
        wrap
          .append("video")
          .attr("src", m.src)
          .attr("autoplay", true)
          .attr("muted", true)
          .attr("loop", true)
          .attr("playsinline", true)
          .property("muted", true);
      } else {
        wrap.append("img").attr("src", m.src).attr("alt", "");
      }
    });
  }

  function renderMedia(item) {
    // nothing to show: let the background draw itself instead
    if (item.media && item.media.length) NoiseField.stop();
    else NoiseField.start();

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      renderMobileMedia(item);
      return;
    }

    mediaRail.html("");
    if (!item.media || !item.media.length) {
      mediaRail.classed("visible", false);
      updateMediaOverlap();
      return;
    }

    const panelEl = document.querySelector(".panel");
    const panelRect = panelEl.getBoundingClientRect();
    const placedRects = [];

    const wraps = mediaRail
      .selectAll("div")
      .data(shuffled(item.media))
      .join("div")
      .attr("class", (m) => "rail-item" + (m.lightbox ? " openable" : ""));

    wraps.each(function (m) {
      const aspect = m.aspect || 1;
      let h = window.innerHeight * (ITEM_MAX_HEIGHT_VH / 100);
      let w = h * aspect;
      if (w > MEDIA_MAX_WIDTH) {
        w = MEDIA_MAX_WIDTH;
        h = w / aspect;
      }

      let best = null;
      let bestScore = Infinity;
      for (let i = 0; i < PLACEMENT_ATTEMPTS; i++) {
        const right = randomRight();
        const top = Math.random() * Math.max(0, window.innerHeight - h);
        const rect = rectAt(right, top, w, h);
        let score = coverFraction(rect, panelRect);
        for (const pr of placedRects) score = Math.max(score, coverFraction(rect, pr));
        if (score < bestScore) {
          bestScore = score;
          best = { right, top, rect };
        }
        if (score <= MAX_COVER_FRACTION) break;
      }
      placedRects.push(best.rect);

      const el = d3.select(this);
      el.style("right", `${best.right}px`).style("top", `${best.top}px`).style("width", `${w}px`).style("height", `${h}px`);
      if (m.lightbox) el.on("click", () => openLightbox(m.lightboxSrc || m.src));

      if (m.type === "video") {
        el.append("video")
          .attr("src", m.src)
          .attr("autoplay", true)
          .attr("muted", true)
          .attr("loop", true)
          .attr("playsinline", true)
          .property("muted", true);
      } else {
        el.append("img").attr("src", m.src).attr("alt", "");
      }
    });
    mediaRail.classed("visible", true);
    updateMediaOverlap();
  }

  function openProject(folderId, itemId) {
    const folder = folders.find((f) => f.id === folderId);
    const item = folder.items.find((it) => it.id === itemId);

    rootOpen = true;
    openFolderId = folderId;
    updateGraph();

    setActiveFolder(folderId);
    nodeSel.classed("selected", (d) => d.type === "item" && d.id === itemId);

    panelBody.html("");

    const header = panelBody.append("div").attr("class", "panel-header");
    header.append("button").attr("class", "panel-back").html("&#8592;").on("click", () => {
      nodeSel.classed("selected", false);
      renderIndex(folderId);
    });
    header.append("span").attr("class", "folder-label").text(folder.label);

    const view = panelBody.append("div").attr("class", "project-view");

    const eyebrow = view.append("div").attr("class", "project-eyebrow");
    eyebrow.append("span").attr("class", "dot");
    eyebrow.append("span").text(item.kind === "project" ? UI.project : item.kind === "page" ? UI.page : UI.placeholder);

    if (item.photo) view.append("img").attr("class", "project-photo").attr("src", item.photo).attr("alt", item.label);

    view.append("div").attr("class", "project-title").text(item.label);
    if (item.subtitle) view.append("div").attr("class", "project-subtitle").text(item.subtitle);
    if (item.meta) view.append("div").attr("class", "project-meta").text(item.meta);

    const body = view.append("div").attr("class", "project-body");
    (item.body || "More detail coming soon for this item.")
      .split("\n\n")
      .forEach((para) => body.append("p").text(para));

    // Details: tags + collaborators (moved out of the always-visible bio
    // text and into this collapsible row)
    const detailsRow = view.append("div").attr("class", "detail-row");
    const detailsHead = detailsRow.append("div").attr("class", "detail-row-head");
    detailsHead.append("span").text(UI.details);
    detailsHead.append("span").attr("class", "detail-toggle").text("+");
    detailsHead.on("click", () => detailsRow.classed("open", !detailsRow.classed("open")));
    const detailsBody = detailsRow.append("div").attr("class", "detail-row-body");
    detailsBody.append("p").attr("class", "detail-tags").text(item.tags || [folder.label, item.subtitle, item.meta].filter(Boolean).join(" · "));
    if (item.credit) detailsBody.append("p").attr("class", "detail-credit").html(`${UI.madeWith}: <strong>${item.credit}</strong>`);

    // Connections: links to related projects, navigating within the app
    const related = (item.related || []).map((id) => folder.items.find((it) => it.id === id)).filter(Boolean);
    if (related.length) {
      const connRow = view.append("div").attr("class", "detail-row");
      const connHead = connRow.append("div").attr("class", "detail-row-head");
      connHead.append("span").text(UI.connections);
      connHead.append("span").attr("class", "detail-toggle").text("+");
      connHead.on("click", () => connRow.classed("open", !connRow.classed("open")));
      const connBody = connRow.append("div").attr("class", "detail-row-body");
      const list = connBody.append("ul").attr("class", "connections-list");
      list
        .selectAll("li")
        .data(related)
        .join("li")
        .append("a")
        .attr("href", "#")
        .text((d) => d.label)
        .on("click", (event, d) => {
          event.preventDefault();
          openProject(folder.id, d.id);
        });
    }

    renderMedia(item);
  }

  function appendResumeSection(view, title, entries, startOpen) {
    const row = view.append("div").attr("class", "detail-row" + (startOpen ? " open" : ""));
    const head = row.append("div").attr("class", "detail-row-head");
    head.append("span").text(title);
    head.append("span").attr("class", "detail-toggle").text("+");
    head.on("click", () => row.classed("open", !row.classed("open")));

    const list = row.append("div").attr("class", "detail-row-body resume-body").append("ul").attr("class", "resume-list");
    const li = list.selectAll("li").data(entries).join("li");
    li.each(function (d) {
      const li = d3.select(this);
      if (d.url) {
        li.append("a").attr("class", "resume-org").attr("href", d.url).attr("target", "_blank").attr("rel", "noopener noreferrer").text(d.org);
      } else {
        li.append("span").attr("class", "resume-org").text(d.org);
      }
      if (d.role) li.append("span").attr("class", "resume-role").text(d.role);
      if (d.years) li.append("span").attr("class", "resume-years").text(d.years);
    });
  }

  function openFolderPage(folderId) {
    const folder = folders.find((f) => f.id === folderId);

    rootOpen = true;
    openFolderId = folderId; // reveals this folder's externalLinks (if any) as graph children
    updateGraph();

    setActiveFolder(folderId);
    nodeSel.classed("selected", (d) => d.type === "folder" && d.id === folderId);

    panelBody.html("");

    const header = panelBody.append("div").attr("class", "panel-header");
    header.append("button").attr("class", "panel-back").html("&#8592;").on("click", () => {
      nodeSel.classed("selected", false);
      renderIndex(null);
    });
    header.append("span").attr("class", "folder-label").text(UI.index);

    const view = panelBody.append("div").attr("class", "project-view");

    const eyebrow = view.append("div").attr("class", "project-eyebrow");
    eyebrow.append("span").attr("class", "dot");
    eyebrow.append("span").text(UI.page);

    if (folder.photo) view.append("img").attr("class", "project-photo").attr("src", folder.photo).attr("alt", folder.label);

    view.append("div").attr("class", "project-title").text(folder.label);

    const body = view.append("div").attr("class", "project-body");
    folder.body.split("\n\n").forEach((para) => body.append("p").text(para));

    if (folder.resumeSections) {
      folder.resumeSections.forEach((section) => appendResumeSection(view, section.title, section.entries, true));
    }

    renderMedia(folder);
  }

  renderIndex(null);
  updateGraph();
})();
