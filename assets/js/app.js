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
  // While the loading intro plays (intro.js), the web starts closed and the
  // body is a full square: the dot of the "i" in the intro becomes it
  const introPlaying = document.documentElement.classList.contains("intro");
  const rootNode = {
    id: "root",
    type: "root",
    label: "Niels Thejls",
    sub: "B. 1997",
    shape: introPlaying ? { kind: "square", scale: 1 } : randomShape(),
  };
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

  // Phones show only the web, centred, with no panel line to stay left of;
  // the web and the spider shrink to fit the smaller screen.
  const MOBILE_BREAKPOINT = 860; // must match the CSS breakpoint
  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;
  const webScale = () => (isMobile() ? Math.min(0.8, Math.max(0.5, Math.min(window.innerWidth, window.innerHeight) / 620)) : 1);

  // Everything in the web (nodes, spider legs) stays inside the viewport
  // and left of the panel line. The bottom edge leaves room for labels.
  const VIEW_PAD = 24;
  const LABEL_ROOM = 44;
  function viewBounds() {
    // on phones the sides also keep room for half a label, which is centred
    // under its shape and can be wider than the narrow screen's edge allows
    const side = isMobile() ? 58 : VIEW_PAD;
    const right = isMobile() ? width - side : width - GRAPH_SAFE_MARGIN;
    return { left: side, top: VIEW_PAD, right, bottom: height - LABEL_ROOM };
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
        .distance((d) => (d.distance ?? (d.source.type === "root" ? 140 : 90)) * webScale())
        .strength(0.9)
    )
    .force("charge", d3.forceManyBody().strength(() => -260 * webScale()))
    .force(
      "collide",
      d3.forceCollide().radius((d) => radius(d) + 26 * webScale())
    )
    .force("x", d3.forceX(() => rootNode.fx + (isMobile() ? 0 : width * 0.04)).strength(0.045))
    .force("y", d3.forceY(() => rootNode.fy + height * 0.01).strength(0.06))
    .on("tick", ticked);

  function anchorRoot() {
    rootNode.fx = width * (isMobile() ? 0.5 : 0.3);
    rootNode.fy = height * (isMobile() ? 0.5 : 0.49);
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
  let rootOpen = !introPlaying;
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
    // crossing the phone breakpoint changes the web's scale: re-read the forces
    simulation.force("link").distance(simulation.force("link").distance());
    simulation.force("charge").strength(simulation.force("charge").strength());
    simulation.force("collide").radius(simulation.force("collide").radius());
    if (spider.moved) {
      const p = keepInView({ x: rootNode.fx, y: rootNode.fy });
      rootNode.fx = p.x;
      rootNode.fy = p.y;
    } else {
      anchorRoot();
    }
    simulation.alpha(0.3).restart();
  }

  // --- spider: click empty space and the web grows legs and walks there ---
  //
  // Each leg is two strings like the navigation ones, with a random shape at
  // the knee and another at the foot. The legs are autonomous: every leg
  // picks its own footholds (near or far, so it bends tight or stretches
  // wide), its own step length, step speed and how restless it is, and it
  // fidgets while the bug stands still. A few simple rules keep it a spider:
  // no more than three legs lifted, never two neighbours on one side unless
  // a leg is overstretched.
  //
  // The bug walks deliberately: it thinks for a moment, then sets off toward
  // the click right away, swinging round the short way while it walks (slow
  // while it's still turned away, picking up speed as it lines up). It
  // hesitates now and then, and its body slows while legs are lifted, so
  // each step seems to carry weight.
  //
  // Legs spring out on a click and keep that same spring while walking:
  // every knee and foot is a point in a small d3 force simulation, pulled
  // toward where the leg wants it with slightly springy damping, so the pop
  // and the walk are one continuous motion.
  const spider = (() => {
    const HIP_ANGLES = [34, 68, 112, 148]; // degrees from the heading, front to back
    // leg sizes at full scale; fit() shrinks them on phones
    let UPPER = 78, LOWER = 96; // leg segment lengths
    let REACH = 128; // body to a comfortable foothold
    const WALK_SPEED = 120; // px per second
    const REST_BEFORE_FOLD = 700; // ms after arriving
    let BODY_MARGIN = 70; // keeps the body far enough in for its legs
    const FOLD_MS = 240; // each leg's snap back into the body
    let SHAPE_FULL_AT = 36; // px from the body where knee/foot shapes reach full size
    function fit() {
      const k = webScale();
      UPPER = 78 * k;
      LOWER = 96 * k;
      REACH = 128 * k;
      BODY_MARGIN = 70 * k;
      SHAPE_FULL_AT = 36 * k;
    }
    const SPRING = 0.22; // pull toward the leg's wanted position, per tick
    const DAMPING = 0.3; // velocity lost per tick: lower is springier

    const state = {
      moved: false,
      target: null,
      phase: "rest", // think | walk | rest
      phaseUntil: 0,
      heading: -Math.PI / 2, // facing up to start
      travel: { x: 0, y: -1 }, // direction the body is actually moving
      speed: 0,
      legsOut: false,
      folding: false,
      restingSince: 0,
      legs: [],
      now: 0,
      lastTime: 0,
      running: false,
    };

    const rand = (lo, hi) => lo + Math.random() * (hi - lo);

    [-1, 1].forEach((side) => {
      HIP_ANGLES.forEach((deg, i) => {
        state.legs.push({
          side,
          index: i,
          front: i < 2,
          angle: (side * deg * Math.PI) / 180,
          foot: null,
          from: null,
          to: null,
          t0: 0,
          stepMs: 0,
          bulge: 0,
          popAt: 0,
          foldAt: 0,
          restless: rand(26, 72), // lag it tolerates before stepping; re-rolled every step
        });
      });
    });

    // --- drawing ---
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

    // Where this leg would rest right now (used to measure how far it lags)
    function restSpot(leg, lead) {
      const b = body(), d = dirAt(state.heading + leg.angle), v = state.travel;
      return { x: b.x + d.x * REACH + v.x * lead, y: b.y + d.y * REACH + v.y * lead };
    }

    // A foothold of the leg's own choosing: near (bent tight) or far
    // (stretched wide), a little off its usual angle, sometimes reaching ahead
    function chooseFoothold(leg, lead) {
      const b = body(), v = state.travel;
      const a = state.heading + leg.angle + rand(-0.22, 0.22);
      const reach = REACH * rand(0.6, 1.18);
      const ahead = lead * rand(0.5, 1.5);
      return keepInView({ x: b.x + Math.cos(a) * reach + v.x * ahead, y: b.y + Math.sin(a) * reach + v.y * ahead });
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

    // --- leg physics: one continuous spring, from the pop through the walk ---
    state.legs.forEach((leg) => {
      leg.kneePoint = { leg, part: "knee" };
      leg.footPoint = { leg, part: "foot" };
    });
    const goal = (p) => {
      const leg = p.leg, b = body();
      if (!leg.foot || (state.legsOut && state.now < leg.popAt)) return b; // never popped yet, or about to
      const pose = p.part === "knee" ? knee(leg) : leg.foot;
      if (state.legsOut) return pose;
      // folding: the pose snaps back into the body, quick from the start
      const t = clamp((state.now - leg.foldAt) / FOLD_MS, 0, 1);
      const out = (1 - t) * (1 - t);
      return { x: b.x + (pose.x - b.x) * out, y: b.y + (pose.y - b.y) * out };
    };
    const legSim = d3
      .forceSimulation(state.legs.flatMap((leg) => [leg.kneePoint, leg.footPoint]))
      .stop()
      .velocityDecay(DAMPING)
      .alphaDecay(0)
      .alpha(1)
      .force("goalX", d3.forceX((p) => goal(p).x).strength(SPRING))
      .force("goalY", d3.forceY((p) => goal(p).y).strength(SPRING));

    function stepPhysics(dt) {
      // forceX/forceY cache their targets, so re-read them every tick
      for (let i = Math.max(1, Math.min(3, Math.round(dt * 60))); i > 0; i--) {
        legSim.force("goalX").x(legSim.force("goalX").x());
        legSim.force("goalY").y(legSim.force("goalY").y());
        legSim.tick();
      }
      return state.legs.every((leg) =>
        [leg.kneePoint, leg.footPoint].every((p) => {
          const g = goal(p);
          return Math.abs(g.x - p.x) + Math.abs(g.y - p.y) < 0.5 && Math.abs(p.vx) + Math.abs(p.vy) < 0.05;
        })
      );
    }

    // Each leg shoots out from the body toward its first foothold, a few
    // ms apart: launched with a kick, so it overshoots before it settles
    function popLegs(now) {
      const b = body();
      // caught mid-fold: carry on from where the legs are instead of resetting
      const midFold = state.folding;
      state.legsOut = true;
      state.folding = false;
      legSel.interrupt();
      state.legs.forEach((leg) => {
        leg.foot = chooseFoothold(leg, 0);
        leg.to = null;
        leg.popAt = midFold ? now : now + rand(0, 40);
        if (midFold) return;
        const kick = { knee: knee(leg), foot: leg.foot };
        [leg.kneePoint, leg.footPoint].forEach((p) => {
          p.x = b.x + rand(-3, 3);
          p.y = b.y + rand(-3, 3);
          p.vx = (kick[p.part].x - p.x) * 0.42;
          p.vy = (kick[p.part].y - p.y) * 0.42;
        });
      });
      // no fade in: the legs are just there, shooting out
      legSel.attr("opacity", 1);
    }

    // one leg after another slides back in and fades, rather than all at once
    function foldLegs(now) {
      state.legsOut = false;
      state.folding = true;
      state.legs.forEach((leg) => {
        leg.to = null;
        leg.foldAt = now + rand(0, 110);
      });
      // the shapes shrink as they reach the body; the strings go at the very end
      legSel
        .interrupt()
        .transition()
        .delay((leg) => leg.foldAt - now + FOLD_MS * 0.7)
        .duration(120)
        .attr("opacity", 0);
    }

    // --- walking ---
    function setPhase(phase, now, ms) {
      state.phase = phase;
      state.phaseUntil = now + ms;
    }

    function crawlTo(x, y) {
      const v = viewBounds();
      const now = performance.now();
      state.now = now;
      state.target = {
        x: clamp(x, v.left + BODY_MARGIN, v.right - BODY_MARGIN),
        y: clamp(y, v.top + BODY_MARGIN, v.bottom - BODY_MARGIN),
      };
      state.moved = true;
      if (!state.legsOut) {
        fit();
        popLegs(now);
      }
      marker.interrupt().attr("x", state.target.x - 2.5).attr("y", state.target.y - 2.5).attr("opacity", 1);
      setPhase("think", now, rand(220, 480)); // considers it before moving
      simulation.alphaTarget(0.2).restart();
      if (!state.running) {
        state.running = true;
        state.lastTime = now;
        requestAnimationFrame(frame);
      }
    }

    function moveBody(now, dt) {
      const dx = state.target.x - rootNode.fx, dy = state.target.y - rootNode.fy;
      const dist = Math.hypot(dx, dy);
      const off = wrap(Math.atan2(dy, dx) - state.heading);

      if (dist < 1.5) {
        state.target = null;
        state.phase = "rest";
        state.speed = 0;
        state.restingSince = now;
        marker.transition().duration(300).attr("opacity", 0);
        simulation.alphaTarget(0);
        return;
      }

      // think → walk, with the odd hesitation on longer walks
      if (state.phase === "think" && now > state.phaseUntil) setPhase("walk", now, rand(600, 1500));
      else if (state.phase === "walk" && now > state.phaseUntil && dist > 100) setPhase("think", now, rand(140, 400));

      // turn the short way round while walking; a glance toward it while thinking
      const turnRate = state.phase === "walk" ? 4.2 : 0.8;
      state.heading += clamp(off, -turnRate * dt, turnRate * dt);

      // slow while still turned away, full pace once lined up
      const lined = Math.max(0.2, Math.cos(off));
      const wanted = state.phase === "walk" ? Math.min(WALK_SPEED, dist * 2.2 + 12) * lined : 0;
      state.speed += (wanted - state.speed) * Math.min(1, dt * 7);

      // weight: the body drags while legs are lifted, pushes on when they plant
      const lifted = state.legs.filter((l) => l.to).length;
      const push = 1 - 0.35 * Math.min(1, lifted / 3);

      const step = Math.min(dist, state.speed * push * dt);
      // always moves toward the click, never off in the wrong direction
      const dir = { x: dx / dist, y: dy / dist };
      state.travel = dir;
      const v = viewBounds();
      rootNode.fx = clamp(rootNode.fx + dir.x * step, v.left + BODY_MARGIN, v.right - BODY_MARGIN);
      rootNode.fy = clamp(rootNode.fy + dir.y * step, v.top + BODY_MARGIN, v.bottom - BODY_MARGIN);

      // the web's forceX/forceY cache their targets too
      simulation.force("x").x(simulation.force("x").x());
      simulation.force("y").y(simulation.force("y").y());
    }

    function startStep(leg, to, now) {
      leg.from = leg.foot;
      leg.to = to;
      leg.t0 = now;
      leg.stepMs = rand(110, 230);
      // the foot swings out on a slight arc, not a straight slide
      leg.bulge = Math.min(14, Math.hypot(to.x - leg.from.x, to.y - leg.from.y) * rand(0.08, 0.2)) * leg.side;
      leg.restless = rand(26, 72);
    }

    // Every leg decides for itself when to step and where to; the shared
    // rules only stop too many legs (or two neighbours) lifting at once
    function moveLegs(now, dt) {
      const lead = state.speed * 0.25;
      const stepping = state.legs.filter((l) => l.to);
      const standing = !state.target || state.phase === "think";
      const b = body();

      state.legs.forEach((leg) => {
        if (!leg.to) return;
        const t = Math.min(1, (now - leg.t0) / leg.stepMs);
        const e = t * t * (3 - 2 * t); // lift slowly, plant softly
        const dx = leg.to.x - leg.from.x, dy = leg.to.y - leg.from.y;
        const len = Math.hypot(dx, dy) || 1;
        const arc = Math.sin(Math.PI * t) * leg.bulge;
        leg.foot = { x: leg.from.x + dx * e - (dy / len) * arc, y: leg.from.y + dy * e + (dx / len) * arc };
        if (t === 1) {
          leg.foot = leg.to;
          leg.to = null;
        }
      });

      state.legs
        .filter((l) => !l.to)
        .map((leg) => {
          const rest = restSpot(leg, lead);
          const reach = Math.hypot(leg.foot.x - b.x, leg.foot.y - b.y);
          const lag = Math.hypot(rest.x - leg.foot.x, rest.y - leg.foot.y);
          const strained = reach > UPPER + LOWER - 6 || reach < REACH * 0.45;
          const fidget = standing && Math.random() < dt * 0.35; // shifts its weight now and then
          return { leg, lag, strained, wants: strained || lag > leg.restless || fidget };
        })
        .filter((c) => c.wants)
        .sort((a, b) => b.lag - a.lag)
        .forEach(({ leg, strained }) => {
          const neighbour = stepping.some((l) => l.side === leg.side && Math.abs(l.index - leg.index) === 1);
          if ((stepping.length >= 3 || neighbour) && !strained) return;
          startStep(leg, chooseFoothold(leg, lead), now);
          stepping.push(leg);
        });
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;
      state.now = now;

      if (state.target) moveBody(now, dt);
      if (state.legsOut && !state.target && now - state.restingSince > REST_BEFORE_FOLD) foldLegs(now);
      if (state.legsOut) moveLegs(now, dt);
      const settled = stepPhysics(dt);
      if (settled && state.folding) state.folding = false;
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
        const k = leg.kneePoint, f = leg.footPoint;
        const el = d3.select(this);
        el.select("path").attr("d", `M${b.x},${b.y}L${k.x},${k.y}L${f.x},${f.y}`);
        // shapes grow as they leave the body and shrink back into it, so the
        // orange centre is never covered
        const size = (p) => clamp(Math.hypot(p.x - b.x, p.y - b.y) / SHAPE_FULL_AT, 0, 1);
        el.select(".leg-knee").attr("transform", `translate(${k.x},${k.y}) scale(${size(k)})`);
        el.select(".leg-foot").attr("transform", `translate(${f.x},${f.y}) scale(${size(f)})`);
      });
      // the body shape turns to face where it's going
      nodeSel
        .filter((d) => d.type === "root")
        .select(".node-shape")
        .attr("transform", `rotate(${(state.heading * 180) / Math.PI + 90})`);
    }

    // Clicks on empty page space only: never the panel, nodes, media or
    // lightbox. Listens in the capture phase, before the menu's own handlers
    // run: those often rebuild the panel and detach the clicked element, so
    // checking afterwards could miss that the click was in the panel. Any
    // click inside the panel's box counts as the panel, whatever it hit.
    const ignored = ".panel, .node, .rail-item, .lightbox, .intro-screen, a, button";
    document.addEventListener(
      "click",
      (event) => {
        if (event.target.closest(ignored)) return;
        const panel = document.querySelector(".panel").getBoundingClientRect();
        const inPanel =
          event.clientX >= panel.left && event.clientX <= panel.right && event.clientY >= panel.top && event.clientY <= panel.bottom;
        if (inPanel) return;
        crawlTo(event.clientX, event.clientY);
      },
      true
    );

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

  // On phones the panel is a sheet that only shows while a project or page
  // is open; the index itself lives in the web
  const showSheet = (on) => d3.select(".panel").classed("sheet-open", on);

  function renderIndex(openId) {
    showSheet(false);
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
    showSheet(true);
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
    showSheet(true);
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

  // The loading intro hands over to the web: the body is placed where the
  // dot of the "i" sits, and the web grows from there once the intro is gone
  window.SpiderWeb = {
    bodyRect: () => nodeSel.filter((d) => d.type === "root").select(".node-shape").node().getBoundingClientRect(),
    placeBody: (x, y) => {
      const p = keepInView({ x, y });
      rootNode.fx = rootNode.x = p.x;
      rootNode.fy = rootNode.y = p.y;
      spider.moved = true; // stays there, as if it had walked there
      simulation.force("x").x(simulation.force("x").x());
      simulation.force("y").y(simulation.force("y").y());
      ticked();
    },
    open: () => {
      if (!rootOpen) toggleRoot();
    },
  };
})();
