(function () {
  const ASCII_GLYPHS = ["■", "▪", "◼", "●", "▲", "▼"]; // solid/filled shapes only, no outline variants
  function randomAscii() {
    return ASCII_GLYPHS[Math.floor(Math.random() * ASCII_GLYPHS.length)];
  }

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
    ctx.font = '46px ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(randomAscii(), size / 2, size / 2 + 2);

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  })();

  const bloomcharge = {
    id: "bloomcharge",
    kind: "project",
    label: "Bloom Charge",
    subtitle: "Motion Design",
    meta: "Re-public · 2026",
    tags: "BLOOM CHARGE · MOTION DESIGN · SHOWREEL · STORYBOARDING · BRANDING · AFTER EFFECTS",
    body: "Motion design and showreel development for Bloom Charge, a next-generation charge point management system for the EV industry.\n\nThe work focused on translating Bloom Charge's tech-forward visual identity into a dynamic motion language, balancing the approachable character of the brand with the precision of its technology.\n\nI developed the motion assets and storyboarded the showreel, bringing the identity to life through a series of engaging visual compositions.",
    credit: "Søren Severin",
    related: ["trdt", "vandalorum"],
    media: [
      { type: "video", src: "assets/projects/bloomcharge/showreel.mp4", aspect: 1920 / 1080 },
      { type: "video", src: "assets/projects/bloomcharge/portrait.mp4", aspect: 2160 / 3840 },
      { type: "video", src: "assets/projects/bloomcharge/square.mp4", aspect: 1 },
      { type: "image", src: "assets/projects/bloomcharge/mockup.png", aspect: 1252 / 2000 },
      { type: "image", src: "assets/projects/bloomcharge/mockup2.png", aspect: 1252 / 2000 },
      { type: "image", src: "assets/projects/bloomcharge/mockup3.png", aspect: 1252 / 2000 },
    ],
  };

  const dks = {
    id: "dks",
    kind: "project",
    label: "Dansk Kvindesamfund",
    subtitle: "UI Design",
    meta: "Stupid Studio · 2025",
    tags: "KALDER ALLE UNGE · DIGITAL DESIGN · GRAPHIC DESIGN · WEB · MOTION · CAMPAIGN · FIGMA · AFTER EFFECTS",
    body: "Digital and graphic design for Dansk Kvindesamfund's Kalder alle unge initiative.\n\nThe project combined physical and digital formats to create an engaging way for young people to explore and discuss topics around gender and equality.\n\nTogether with the team, I developed the visual design and layouts for 10 conversation starter games, alongside digitalising selected games for the web.\n\nThe project also included motion assets for the case presentation, bringing the different elements together into a cohesive and engaging digital experience.",
    credit: "Amanda Mikkelsen, Leyla Melis Aslan, Sarah Carlson",
    related: ["bloomcharge", "ikeafoundation"],
    media: [
      { type: "video", src: "assets/projects/dks/game-card.mp4", aspect: 1080 / 1350 },
      { type: "video", src: "assets/projects/dks/game-card-2.mp4", aspect: 1080 / 1350 },
      { type: "video", src: "assets/projects/dks/game-card-3.mp4", aspect: 1080 / 1350 },
      { type: "video", src: "assets/projects/dks/screen-recording.mp4", aspect: 396 / 750 },
      { type: "video", src: "assets/projects/dks/image-flick.mp4", aspect: 1466 / 938 },
      { type: "video", src: "assets/projects/dks/stickersheet.mp4", aspect: 2160 / 3840 },
      { type: "image", src: "assets/projects/dks/some-02.png", aspect: 1080 / 1350 },
      { type: "image", src: "assets/projects/dks/some-05.png", aspect: 1080 / 1350 },
    ],
  };

  const vandalorum = {
    id: "vandalorum",
    kind: "project",
    label: "Vandalorum",
    subtitle: "Motion Design",
    meta: "Vandalorum",
    tags: "VANDALORUM · MOTION DESIGN · POSTER · CULTURAL · 2D ANIMATION · AFTER EFFECTS",
    body: "A motion poster for Vandalorum, a Swedish museum for art and design.\n\nThe existing poster was translated into a playful moving composition, bringing its illustrated elements to life through motion.\n\nThe animation adds rhythm and interaction to the original visual language while retaining the character of the static poster.",
    related: ["trdt", "bloomcharge"],
    media: [
      { type: "video", src: "assets/projects/vandalorum/motion-poster.mp4", aspect: 1192 / 1686 },
      { type: "video", src: "assets/projects/vandalorum/screen-recording.mp4", aspect: 572 / 334 },
      { type: "image", src: "assets/projects/vandalorum/poster.png", aspect: 1192 / 1686 },
    ],
  };

  const trdt = {
    id: "trdt",
    kind: "project",
    label: "Royal Danish Theatre",
    subtitle: "Motion Design",
    meta: "Royal Danish Theatre · 2025",
    tags: "DON JUAN · MOTION DESIGN · CAMPAIGN · DIGITAL · TYPOGRAPHY · AFTER EFFECTS",
    body: "A promotional motion campaign for the Royal Danish Theatre's 2025 rerun of Don Juan.\n\nThe work explores the more contemporary side of the classic character, translating the play's themes of seduction, excess and chaos into a dynamic visual language.\n\nMotion, typography and imagery are used to create a fast-paced and engaging system designed for promotion across digital platforms.\n\nA modern interpretation of a familiar story.",
    related: ["bloomcharge", "vandalorum"],
    media: [
      { type: "video", src: "assets/projects/trdt/landscape.mp4", aspect: 1920 / 1080 },
      {
        type: "video",
        src: "assets/projects/trdt/portrait-4x5.mp4",
        aspect: 1080 / 1350,
        lightbox: true,
        lightboxSrc: "assets/projects/trdt/portrait-4x5-sound.mp4", // the muted background rail uses a silent export; this is the same cut re-transcoded from the ProRes master with its audio track intact
      },
      { type: "video", src: "assets/projects/trdt/square.mp4", aspect: 1 },
      { type: "video", src: "assets/projects/trdt/story.mp4", aspect: 1080 / 1920 },
    ],
  };

  const ikeafoundation = {
    id: "ikeafoundation",
    kind: "project",
    label: "IKEA Foundation",
    subtitle: "Digital Design",
    meta: "Stupid Studio · 2026",
    tags: "IKEA FOUNDATION · DIGITAL DESIGN · WEB · SITE IMPLEMENTATION · CMS · FIGMA · CRAFT CMS · COLLABORATION",
    body: "Digital implementation and site population for the new IKEA Foundation website and the 2026 IKEA Foundation Week campaign site.\n\nWorking alongside designers, copywriters and developers to bring the visual identity into a flexible digital environment.\n\nThe work involved translating designs into responsive web pages, populating content and ensuring consistency across the different digital touchpoints.",
    related: ["dks", "bloomcharge"],
    media: [
      { type: "video", src: "assets/projects/ikeafoundation/screen-recording-1.mp4", aspect: 1654 / 842 },
      { type: "video", src: "assets/projects/ikeafoundation/screen-recording-2.mp4", aspect: 1654 / 842 },
    ],
  };

  const folders = [
    {
      id: "client-work",
      label: "Client Work",
      description: "Selected client casework.",
      items: [bloomcharge, dks, vandalorum, trdt, ikeafoundation],
    },
    {
      id: "archive-work",
      label: "Archive Work",
      body: "A collection of experiments, studies, ideas and visual detours.\n\nThe archive is where I explore things without necessarily knowing where they're going. Typography, motion, image-making, code, identity, interaction and everything in between.\n\nSome are finished. Some are not. Some were made to solve a problem, others to create one.\n\nMostly, this is just a place to follow curiosity.",
      media: [
        { type: "video", src: "assets/projects/archive/screen-recording-1.mp4", aspect: 1080 / 1920 },
        { type: "video", src: "assets/projects/archive/screen-recording-2.mp4", aspect: 1080 / 1080 },
        { type: "video", src: "assets/projects/archive/notes.mp4", aspect: 1080 / 1920 },
        { type: "video", src: "assets/projects/archive/lou.mp4", aspect: 760 / 432 },
        { type: "video", src: "assets/projects/archive/model-training.mp4", aspect: 1042 / 1042 },
      ],
      items: [],
    },
    {
      id: "bio",
      label: "Bio",
      photo: "assets/Niels_Pas_Wide_compressed.png",
      body: "I'm Niels, a visual designer working across brand, digital and motion.\n\nCuriosity is at the centre of my practice. I like exploring how things work, finding connections between disciplines and following ideas far enough to see where they lead.\n\nMy work moves between visual identities, digital experiences, motion and experimentation, with a focus on turning complex ideas into clear and engaging visual systems.\n\nI enjoy working collaboratively, where different perspectives and disciplines can challenge an idea and make it better.",
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
    f.ascii = randomAscii();
    f.items.forEach((it) => {
      it.ascii = randomAscii();
    });
    (f.externalLinks || []).forEach((lnk) => {
      lnk.ascii = randomAscii();
    });
  });

  // Persistent node objects — built once so a node keeps its position (and
  // the simulation keeps its momentum) across every reveal/hide cycle,
  // instead of resetting each time it re-enters the graph.
  const rootNode = { id: "root", type: "root", label: "Niels Thejls", sub: "B. 1997", ascii: randomAscii() };
  const folderNodes = new Map();
  const itemNodes = new Map();
  const linkNodes = new Map();
  folders.forEach((f) => {
    folderNodes.set(f.id, { id: f.id, type: "folder", label: f.label, ascii: f.ascii, hasItems: f.items.length > 0 });
    f.items.forEach((it) => {
      itemNodes.set(it.id, { id: it.id, type: "item", label: it.label, ascii: it.ascii, folderId: f.id, item: it });
    });
    (f.externalLinks || []).forEach((lnk) => {
      linkNodes.set(lnk.id, { id: lnk.id, type: "link", label: lnk.label, ascii: lnk.ascii, url: lnk.url, folderId: f.id });
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
    g.append("text")
      .attr("class", "node-ascii")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", fontSize(d) + "px")
      .text(d.ascii);

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
        row.append("span").attr("class", "folder-icon").text(f.ascii);
        row.append("span").attr("class", "folder-label").text(f.label);
        row.append("span").attr("class", "folder-toggle").text(hasItems ? "+" : "→");

        if (hasItems) {
          const content = li.append("div").attr("class", "folder-content");
          content.append("p").text(f.description);
          const ul = content.append("ul");
          const itemLi = ul.selectAll("li").data(f.items).join("li").append("a").attr("href", "#");
          itemLi.append("span").attr("class", "item-icon").text((d) => d.ascii);
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
    eyebrow.append("span").text(item.kind === "project" ? "Project" : item.kind === "page" ? "Page" : "Placeholder");

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
    detailsHead.append("span").text("Details");
    detailsHead.append("span").attr("class", "detail-toggle").text("+");
    detailsHead.on("click", () => detailsRow.classed("open", !detailsRow.classed("open")));
    const detailsBody = detailsRow.append("div").attr("class", "detail-row-body");
    detailsBody.append("p").attr("class", "detail-tags").text(item.tags || [folder.label, item.subtitle, item.meta].filter(Boolean).join(" · "));
    if (item.credit) detailsBody.append("p").attr("class", "detail-credit").html(`Made with: <strong>${item.credit}</strong>`);

    // Connections: links to related projects, navigating within the app
    const related = (item.related || []).map((id) => folder.items.find((it) => it.id === id)).filter(Boolean);
    if (related.length) {
      const connRow = view.append("div").attr("class", "detail-row");
      const connHead = connRow.append("div").attr("class", "detail-row-head");
      connHead.append("span").text("Connections");
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
    header.append("span").attr("class", "folder-label").text("Index");

    const view = panelBody.append("div").attr("class", "project-view");

    const eyebrow = view.append("div").attr("class", "project-eyebrow");
    eyebrow.append("span").attr("class", "dot");
    eyebrow.append("span").text("Page");

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
