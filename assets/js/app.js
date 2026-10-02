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
  const linkLayer = svg.append("g").attr("class", "links");
  const nodeLayer = svg.append("g").attr("class", "nodes");

  const radius = (d) => (d.type === "root" ? 22 : d.type === "folder" ? 18 : 14);
  const fontSize = (d) => (d.type === "root" ? 34 : d.type === "folder" ? 28 : 22);

  // The graph is clamped to x <= width - GRAPH_SAFE_MARGIN, so media is
  // kept entirely to the right of that same line — the two can never
  // occupy the same horizontal territory, not just visually resolved
  // after the fact.
  const GRAPH_SAFE_MARGIN = 480;

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
    .force("x", d3.forceX(() => width * 0.34).strength(0.045))
    .force("y", d3.forceY(() => height * 0.5).strength(0.06))
    .on("tick", ticked);

  function anchorRoot() {
    rootNode.fx = width * 0.3;
    rootNode.fy = height * 0.49;
  }
  anchorRoot();
  rootNode.x = rootNode.fx;
  rootNode.y = rootNode.fy;

  function ticked() {
    const panelBoundary = width - GRAPH_SAFE_MARGIN;
    simulation.nodes().forEach((d) => {
      if (d.type !== "root" && d.x > panelBoundary) d.x = panelBoundary;
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
    anchorRoot();
    simulation.alpha(0.3).restart();
  }
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
