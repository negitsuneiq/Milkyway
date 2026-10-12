(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const arrowIcon =
    '<svg class="arrow-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  const bodies = window.SOLAR_BODIES;
  const byId = new Map(
    bodies.map((body, index) => [
      body.id,
      { ...body, index, phase: index * 2.399963 },
    ]),
  );
  const solar = [...byId.values()].filter((body) => body.kind !== "moon");
  const planets = solar.filter((body) => body.kind === "planet");
  const moons = [...byId.values()].filter((body) => body.kind === "moon");
  const children = (id) => moons.filter((body) => body.parent === id);
  const locale = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
  const number = (value) => locale.format(value);
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motionQuery.matches,
    paused = false,
    selected = byId.get("earth");
  let filter = "planet",
    view = "solar",
    host = "earth",
    speedMode = "normal",
    days = 0;
  let orbitVisible = false,
    globeVisible = false,
    raceVisible = false;
  let frame = 0,
    previous = 0,
    dirty = true,
    clockTime = -Infinity;
  let angle = 0,
    tilt = 0.2,
    globeDirty = true,
    globeDrag = null;
  let raceRunning = false,
    raceElapsed = 0,
    raceLastText = "";
  const speeds = {
    solar: { slow: 5, normal: 30, fast: 120 },
    moons: { slow: 0.02, normal: 0.2, fast: 1 },
  };
  const orbit = $("orr"),
    ctx = orbit.getContext("2d", { alpha: false });
  const globe = $("gl"),
    globeCtx = globe.getContext("2d");
  const backdrop = document.createElement("canvas"),
    backCtx = backdrop.getContext("2d", { alpha: false });
  let width = 0,
    height = 0,
    dpr = 1,
    centerX = 0,
    centerY = 0,
    radius = 0,
    flatten = 0.72;
  let plotted = [],
    positions = [],
    pathRadii = [];
  const spriteCache = new Map();
  const picker = $("picker");

  function requestDraw() {
    dirty = true;
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function moving() {
    return !paused && !reduced;
  }
  function keepRunning() {
    return (
      (moving() && (orbitVisible || globeVisible)) ||
      (raceRunning && raceVisible)
    );
  }
  function tick(time) {
    frame = 0;
    if (document.hidden) {
      previous = 0;
      return;
    }
    // One shared loop. Limit painting to 30 fps, including high-refresh iPhones.
    if (previous && time - previous < 1000 / 30 - 0.6 && !dirty) {
      if (keepRunning()) frame = requestAnimationFrame(tick);
      return;
    }
    const dt = previous ? Math.min((time - previous) / 1000, 0.1) : 0;
    previous = time;
    if (moving()) {
      if (orbitVisible) days += speeds[view][speedMode] * dt;
      if (globeVisible && !globeDrag) {
        angle += dt * (selected.spin < 0 ? -0.16 : 0.16);
        globeDirty = true;
      }
    }
    if (orbitVisible && (dirty || moving())) drawOrbit();
    if (globeVisible && globeDirty) {
      drawGlobe();
      globeDirty = false;
    }
    if (orbitVisible && (time - clockTime > 250 || dirty)) {
      $("clock").textContent =
        days < 365.25
          ? `${number(days)} gün`
          : `${number(days / 365.25)} Dünya yılı`;
      clockTime = time;
    }
    if (raceRunning && raceVisible) {
      raceElapsed += dt * (14994 / 9);
      drawRace();
    }
    dirty = false;
    if (keepRunning()) frame = requestAnimationFrame(tick);
    else previous = 0;
  }

  function syncControls() {
    $("pp").setAttribute("aria-pressed", String(paused || reduced));
    $("pp").innerHTML =
      paused || reduced
        ? '<span aria-hidden="true">▷</span> Oynat'
        : '<span aria-hidden="true">Ⅱ</span> Duraklat';
    $("model-status").textContent =
      paused || reduced ? "DURAĞAN MODEL" : "HAREKETLİ MODEL";
    $("speed-label").textContent =
      `1 sn = ${number(speeds[view][speedMode])} gün`;
    $("motion-toggle").setAttribute("aria-pressed", String(reduced));
    $("motion-toggle").textContent = reduced
      ? "Hareketi etkinleştir"
      : "Hareketi azalt";
    document.documentElement.classList.toggle("reduced-motion", reduced);
    document
      .querySelectorAll("[data-speed]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.speed === speedMode),
        ),
      );
    $("solar-view").setAttribute("aria-pressed", String(view === "solar"));
    $("moon-view").setAttribute("aria-pressed", String(view === "moons"));
    $("host-control").hidden = view !== "moons";
    $("primary-legend").textContent =
      view === "moons" ? "Uydu yörüngesi" : "Gezegen";
    $("dwarf-legend").hidden = view === "moons";
    $("host-select").value = host;
  }
  function fillPicker() {
    picker.replaceChildren();
    [...byId.values()]
      .filter((body) => body.kind === filter)
      .forEach((body) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.body = body.id;
        button.setAttribute("aria-pressed", String(selected.id === body.id));
        button.style.setProperty("--dot", body.color);
        const dot = document.createElement("i");
        dot.setAttribute("aria-hidden", "true");
        button.append(dot, document.createTextNode(body.name));
        if (body.parent) button.title = `${byId.get(body.parent).name} uydusu`;
        button.addEventListener("click", () => {
          if (body.kind !== "moon") view = "solar";
          selectBody(body.id);
        });
        picker.append(button);
      });
    document
      .querySelectorAll("[data-filter]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === filter),
        ),
      );
  }
  function periodLabel(body) {
    return body.period > 365.25
      ? `${number(body.period / 365.25)} yıl`
      : `${number(body.period)} gün`;
  }
  function selectBody(id, announce = true) {
    selected = byId.get(id);
    if (selected.kind === "moon") {
      view = "moons";
      host = selected.parent;
      filter = "moon";
    } else {
      if (view === "moons" && children(id).length) {
        host = id;
        filter = "moon";
      } else {
        view = "solar";
        if (selected.kind !== "star") filter = selected.kind;
      }
    }
    $("pname").textContent = selected.name;
    $("pdesc").textContent = selected.description;
    $("pfact").textContent = selected.fact;
    $("pkind").textContent = {
      star: "YILDIZ",
      planet: "GEZEGEN",
      dwarf: "CÜCE GEZEGEN",
      moon: "DOĞAL UYDU",
    }[selected.kind];
    $("body-index").textContent = String(selected.index).padStart(2, "0");
    const data = [
      [
        "Çap",
        `${number(selected.diameter)} km${selected.diameterNote ? " (yaklaşık)" : ""}`,
      ],
    ];
    if (selected.parent)
      data.push(
        ["Merkez cisim", byId.get(selected.parent).name],
        ["Merkeze uzaklık", `${number(selected.distance)} km`],
        ["Dolanım süresi", periodLabel(selected)],
      );
    else if (selected.period)
      data.push(
        ["Güneş’e uzaklık", `${number(selected.distance)} AB`],
        ["Dolanım süresi", periodLabel(selected)],
        [
          "Sınıf",
          selected.kind === "dwarf"
            ? "Cüce gezegen"
            : selected.index < 5
              ? "Kayalık"
              : ["jupiter", "saturn"].includes(id)
                ? "Gaz devi"
                : "Buz devi",
        ],
      );
    else
      data.push(
        ["Yaş", "≈ 4,6 milyar yıl"],
        ["Yüzey sıcaklığı", "≈ 5.500 °C"],
        ["Sınıf", "G tipi yıldız"],
      );
    $("pdata").replaceChildren(
      ...data.flatMap(([label, value]) => {
        const dt = document.createElement("dt"),
          dd = document.createElement("dd");
        dt.textContent = label;
        dd.textContent = value;
        return [dt, dd];
      }),
    );
    const count = children(id).length;
    $("explore-moons").hidden = !count && !selected.parent;
    $("explore-moons").innerHTML = selected.parent
      ? `${byId.get(selected.parent).name} sistemini gör ${arrowIcon}`
      : `${count} seçili uyduyu keşfet ${arrowIcon}`;
    globe.setAttribute(
      "aria-label",
      `${selected.name} sanatsal küresi. Yatay sürükle veya ok tuşlarıyla döndür.`,
    );
    document.documentElement.style.setProperty("--body-color", selected.color);
    angle = 0;
    globeDirty = true;
    // Preserve keyboard focus when selection updates an existing picker.
    const activeBody = document.activeElement?.dataset.body;
    fillPicker();
    if (activeBody)
      picker
        .querySelector(`[data-body="${activeBody}"]`)
        ?.focus({ preventScroll: true });
    syncControls();
    buildBackdrop();
    requestDraw();
    if (announce)
      $("sr").textContent =
        `${selected.name} seçildi. ${selected.parent ? byId.get(selected.parent).name + " uydu sistemi." : "Güneş sistemi."}`;
  }
  function setView(next) {
    view = next;
    if (view === "moons") {
      host =
        selected.parent || (children(selected.id).length ? selected.id : host);
      selectBody(host);
    } else {
      selectBody(selected.parent || selected.id);
    }
  }
  $("solar-view").addEventListener("click", () => setView("solar"));
  $("moon-view").addEventListener("click", () => setView("moons"));
  $("host-select").addEventListener("change", (event) => {
    host = event.target.value;
    selectBody(host);
  });
  $("explore-moons").addEventListener("click", () => {
    host = selected.parent || selected.id;
    view = "moons";
    selectBody(selected.parent ? host : children(host)[0].id);
    orbit.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
  });
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      fillPicker();
    }),
  );
  document.querySelectorAll("[data-speed]").forEach((button) =>
    button.addEventListener("click", () => {
      speedMode = button.dataset.speed;
      syncControls();
      requestDraw();
    }),
  );
  $("pp").addEventListener("click", () => {
    if (reduced) {
      reduced = false;
      paused = false;
    } else paused = !paused;
    syncControls();
    requestDraw();
  });
  function setMotion(value) {
    reduced = value;
    if (reduced && raceRunning) {
      raceElapsed = 14994;
      drawRace();
    }
    syncControls();
    globeDirty = true;
    requestDraw();
  }
  $("motion-toggle").addEventListener("click", () => setMotion(!reduced));
  motionQuery.addEventListener("change", (event) => setMotion(event.matches));

  function size(bounds) {
    const nextDpr = Math.min(devicePixelRatio || 1, 1.5);
    if (width === bounds.width && height === bounds.height && dpr === nextDpr)
      return;
    width = bounds.width;
    height = bounds.height;
    dpr = nextDpr;
    orbit.width = backdrop.width = Math.round(width * dpr);
    orbit.height = backdrop.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    backCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width / 2;
    centerY = height / 2 + (view === "moons" ? 18 : 0);
    flatten = width < 500 ? 0.88 : 0.69;
    radius = Math.min(width / 2 - 25, (height / 2 - 30) / flatten);
    buildBackdrop();
    requestDraw();
  }
  function buildBackdrop() {
    if (!width) return;
    centerY = height / 2 + (view === "moons" ? 18 : 0);
    plotted = view === "solar" ? solar : [byId.get(host), ...children(host)];
    pathRadii = plotted.map((body, index) =>
      index === 0
        ? 0
        : view === "solar"
          ? radius * (0.16 + (0.84 * index) / (plotted.length - 1))
          : radius * (0.34 + (0.66 * index) / (plotted.length - 1)),
    );
    $("view-title").textContent =
      view === "solar"
        ? "Güneş’in çevresinde"
        : `${byId.get(host).name} ve yakın dünyaları`;
    $("orbit-count").textContent =
      view === "solar"
        ? "13 dünya · 1 yıldız"
        : `${plotted.length - 1} seçili uydu`;
    $("orbit-hint").textContent =
      view === "solar"
        ? "Bir cisme dokun"
        : host === "pluto"
          ? "+ Ortak kütle merkezi"
          : "Yerel yörüngeler";
    backCtx.fillStyle = "#131716";
    backCtx.fillRect(0, 0, width, height);
    let seed = 418;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 90; i++) {
      backCtx.fillStyle = `rgba(202,211,194,${0.08 + random() * 0.24})`;
      backCtx.fillRect(random() * width, random() * height, 1, 1);
    }
    // Static orbit paths and the asteroid belt are rasterized once per view/resize.
    plotted.forEach((body, index) => {
      if (!index) return;
      const r =
        pathRadii[index] * (view === "moons" && host === "pluto" ? 0.8915 : 1);
      backCtx.strokeStyle = body.kind === "dwarf" ? "#5f584740" : "#8d9a7836";
      backCtx.lineWidth = 0.75;
      backCtx.setLineDash(body.kind === "dwarf" ? [2, 5] : []);
      backCtx.beginPath();
      backCtx.ellipse(centerX, centerY, r, r * flatten, 0, 0, Math.PI * 2);
      backCtx.stroke();
    });
    backCtx.setLineDash([]);
    if (view === "moons" && host === "pluto") {
      const r = pathRadii[1] * 0.1085;
      backCtx.beginPath();
      backCtx.ellipse(centerX, centerY, r, r * flatten, 0, 0, Math.PI * 2);
      backCtx.stroke();
    }
    if (view === "solar") {
      const beltRadius = (pathRadii[5] + pathRadii[6]) / 2;
      for (let i = 0; i < 180; i++) {
        const a = random() * Math.PI * 2,
          r = beltRadius + (random() - 0.5) * 9;
        backCtx.fillStyle = "#a39f7625";
        backCtx.fillRect(
          centerX + Math.cos(a) * r,
          centerY + Math.sin(a) * r * flatten,
          1,
          1,
        );
      }
    }
  }
  function sprite(body) {
    if (spriteCache.has(body.id)) return spriteCache.get(body.id);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 80;
    const c = canvas.getContext("2d");
    const gradient = c.createRadialGradient(29, 26, 2, 41, 41, 31);
    gradient.addColorStop(0, body.kind === "star" ? "#fff3c7" : body.color);
    gradient.addColorStop(0.45, body.color);
    gradient.addColorStop(1, body.kind === "star" ? "#c16c2f" : "#111614");
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(40, 40, 30, 0, Math.PI * 2);
    c.fill();
    spriteCache.set(body.id, canvas);
    return canvas;
  }
  function point(body, index) {
    const local = view === "moons";
    const period = body.period || 1;
    const a =
      body.phase + (days / period) * Math.PI * 2 * (body.retrograde ? -1 : 1);
    const r = pathRadii[index];
    if (!index) {
      if (local && host === "pluto") {
        const charon = byId.get("charon"),
          theta = charon.phase + (days / charon.period) * Math.PI * 2;
        return {
          x: centerX - Math.cos(theta) * pathRadii[1] * 0.1085,
          y: centerY - Math.sin(theta) * pathRadii[1] * flatten * 0.1085,
        };
      }
      return { x: centerX, y: centerY };
    }
    const factor = local && host === "pluto" ? 0.8915 : 1;
    return {
      x: centerX + Math.cos(a) * r * factor,
      y: centerY + Math.sin(a) * r * flatten * factor,
    };
  }
  function drawOrbit() {
    ctx.drawImage(backdrop, 0, 0, width, height);
    positions = plotted.map((body, index) => {
      const p = point(body, index);
      let r =
        index === 0
          ? view === "solar"
            ? 14
            : 24
          : view === "moons"
            ? Math.max(4, Math.min(10, body.diameter / 600))
            : body.kind === "dwarf"
              ? 3.5
              : Math.max(4, Math.min(9, body.diameter / 15000 + 3));
      if (view === "moons" && host === "pluto") {
        // Keep the barycentre visibly outside Pluto at every projected angle.
        // Other system sizes are schematic; this pair preserves its diameter ratio.
        const plutoRadius = Math.min(18, pathRadii[1] * 0.1085 * flatten * 0.6);
        r =
          index === 0
            ? plutoRadius
            : plutoRadius * (body.diameter / byId.get("pluto").diameter);
      }
      if (!index && view === "solar") {
        const glow = ctx.createRadialGradient(p.x, p.y, 6, p.x, p.y, 42);
        glow.addColorStop(0, "#f0b46930");
        glow.addColorStop(1, "#f0b46900");
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - 42, p.y - 42, 84, 84);
      }
      if (body.ring) {
        ctx.strokeStyle = "#d6bc8599";
        ctx.lineWidth = Math.max(2, r * 0.23);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, r * 1.9, r * 0.45, -0.45, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.drawImage(
        sprite(body),
        p.x - (r * 4) / 3,
        p.y - (r * 4) / 3,
        (r * 8) / 3,
        (r * 8) / 3,
      );
      if (body.id === selected.id) {
        ctx.strokeStyle = "#edb783";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (
        body.id === selected.id ||
        !index ||
        view === "moons" ||
        (width > 540 && body.kind === "planet")
      ) {
        ctx.font = `${body.id === selected.id ? "500" : "400"} 10px "DM Sans", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = body.id === selected.id ? "#edb783" : "#b9c0b1";
        const labelWidth = ctx.measureText(body.name).width;
        const x = Math.max(
          labelWidth / 2 + 5,
          Math.min(width - labelWidth / 2 - 5, p.x),
        );
        ctx.fillText(body.name, x, p.y + r + 20);
      }
      return { ...p, r, id: body.id };
    });
    if (view === "moons" && host === "pluto") {
      ctx.strokeStyle = "#edb783aa";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 4, centerY);
      ctx.lineTo(centerX + 4, centerY);
      ctx.moveTo(centerX, centerY - 4);
      ctx.lineTo(centerX, centerY + 4);
      ctx.stroke();
    }
  }
  let gesture = null;
  orbit.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  orbit.addEventListener("pointercancel", () => {
    gesture = null;
  });
  orbit.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x,
      dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      cycle(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) return;
    const bounds = orbit.getBoundingClientRect(),
      x = event.clientX - bounds.left,
      y = event.clientY - bounds.top;
    const nearest = positions
      .map((p) => ({ ...p, d: Math.hypot(x - p.x, y - p.y) }))
      .filter((p) => p.d < Math.max(22, p.r + 9))
      .sort((a, b) => a.d - b.d)[0];
    if (nearest) selectBody(nearest.id);
  });
  function cycle(direction) {
    const list =
      view === "moons"
        ? plotted
        : [...byId.values()].filter((body) => body.kind === filter);
    const index = list.findIndex((body) => body.id === selected.id);
    selectBody(list[(index + direction + list.length) % list.length].id);
  }
  orbit.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      cycle(event.key === "ArrowRight" ? 1 : -1);
    }
    if (event.key === " ") {
      event.preventDefault();
      $("pp").click();
    }
  });
  globe.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    globeDrag = { x: event.clientX, y: event.clientY, id: event.pointerId };
    globe.setPointerCapture(event.pointerId);
  });
  globe.addEventListener("pointermove", (event) => {
    if (!globeDrag || event.pointerId !== globeDrag.id) return;
    angle += (event.clientX - globeDrag.x) * 0.015;
    tilt = Math.max(
      -1,
      Math.min(1, tilt + (event.clientY - globeDrag.y) * 0.008),
    );
    globeDrag.x = event.clientX;
    globeDrag.y = event.clientY;
    globeDirty = true;
    requestDraw();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
    globe.addEventListener(type, () => {
      globeDrag = null;
    }),
  );
  globe.addEventListener("keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "ArrowLeft" || event.key === "ArrowRight")
      angle += event.key === "ArrowLeft" ? -0.2 : 0.2;
    else
      tilt = Math.max(
        -1,
        Math.min(1, tilt + (event.key === "ArrowUp" ? -0.1 : 0.1)),
      );
    globeDirty = true;
    requestDraw();
  });

  // A small, lazy texture cache; sphere projection and lighting are precomputed.
  const GS = 200,
    TW = 192,
    TH = 96;
  const pixels = globeCtx.createImageData(GS, GS),
    projectionCache = new Map(),
    textures = new Map();
  function noise(x, y, z) {
    let h =
      (Math.imul(x | 0, 374761393) +
        Math.imul(y | 0, 668265263) +
        Math.imul(z | 0, 1274126177)) |
      0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function valueNoise(x, y, z) {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      iz = Math.floor(z);
    let fx = x - ix,
      fy = y - iy,
      fz = z - iz;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    fz = fz * fz * (3 - 2 * fz);
    const lerp = (a, b, t) => a + (b - a) * t;
    return lerp(
      lerp(
        lerp(noise(ix, iy, iz), noise(ix + 1, iy, iz), fx),
        lerp(noise(ix, iy + 1, iz), noise(ix + 1, iy + 1, iz), fx),
        fy,
      ),
      lerp(
        lerp(noise(ix, iy, iz + 1), noise(ix + 1, iy, iz + 1), fx),
        lerp(noise(ix, iy + 1, iz + 1), noise(ix + 1, iy + 1, iz + 1), fx),
        fy,
      ),
      fz,
    );
  }
  function fractal(x, y, z) {
    let value = 0,
      strength = 0.5;
    for (let i = 0; i < 3; i++) {
      value += strength * valueNoise(x, y, z);
      x *= 2.03;
      y *= 2.03;
      z *= 2.03;
      strength *= 0.5;
    }
    return value * 1.6;
  }
  function mix(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    return a.map((v, i) => v + (b[i] - v) * t);
  }
  function makeTexture(body) {
    const data = new Uint8ClampedArray(TW * TH * 3),
      hex = parseInt(body.color.slice(1), 16),
      base = [hex >> 16, (hex >> 8) & 255, hex & 255];
    for (let v = 0; v < TH; v++) {
      const lat = (v / TH - 0.5) * Math.PI,
        Y = Math.sin(lat),
        cl = Math.cos(lat);
      for (let u = 0; u < TW; u++) {
        const lon = (u / TW) * Math.PI * 2,
          X = cl * Math.cos(lon),
          Z = cl * Math.sin(lon);
        let n = fractal(X * 3 + body.index, Y * 3, Z * 3),
          color;
        if (body.id === "earth") {
          n = fractal(X * 2.2 + 3, Y * 2.2, Z * 2.2);
          color =
            n > 0.8
              ? mix([52, 91, 59], [161, 153, 102], (n - 0.8) * 3)
              : mix([14, 42, 63], [58, 126, 151], n);
          color = mix(color, [220, 232, 228], (Math.abs(Y) - 0.84) * 13);
          color = mix(
            color,
            [229, 232, 218],
            (fractal(X * 4 + 9, Y * 6, Z * 4) - 0.82) * 2.8,
          );
        } else if (body.id === "jupiter" || body.id === "saturn") {
          const band =
            Math.sin(lat * (body.id === "jupiter" ? 18 : 24) + n * 3) * 0.5 +
            0.5;
          color = mix(
            base.map((c) => c * 0.62),
            [242, 220, 182],
            band,
          );
        } else if (body.id === "uranus" || body.id === "neptune") {
          color = mix(
            base.map((c) => c * 0.7),
            base,
            0.6 + 0.25 * Math.sin(lat * 8 + n),
          );
        } else {
          color = mix(
            base.map((c) => c * 0.52),
            base,
            n * 1.3,
          );
          if (body.id === "mars")
            color = mix(color, [230, 220, 209], (Math.abs(Y) - 0.92) * 12);
          if (body.id === "europa")
            color = mix(
              color,
              [111, 84, 62],
              Math.pow(Math.max(0, Math.sin(lon * 13 + lat * 21)), 20) * 0.5,
            );
        }
        const k = (v * TW + u) * 3;
        data[k] = color[0];
        data[k + 1] = color[1];
        data[k + 2] = color[2];
      }
    }
    return data;
  }
  function projection(r) {
    if (projectionCache.has(r)) return projectionCache.get(r);
    const result = [];
    for (let y = Math.floor(100 - r); y <= 100 + r; y++)
      for (let x = Math.floor(100 - r); x <= 100 + r; x++) {
        const nx = (x - 100 + 0.5) / r,
          ny = (100 - y - 0.5) / r,
          d = nx * nx + ny * ny;
        if (d > 1) continue;
        const nz = Math.sqrt(1 - d),
          light =
            0.06 +
            0.94 *
              Math.pow(Math.max(0, -0.55 * nx + 0.5 * ny + 0.67 * nz), 0.85);
        result.push({
          offset: (y * GS + x) * 4,
          nx,
          ny,
          nz,
          light,
          alpha: Math.min(1, (1 - Math.sqrt(d)) * r + 0.5) * 255,
        });
      }
    projectionCache.set(r, result);
    return result;
  }
  function drawGlobe() {
    if (!textures.has(selected.id))
      textures.set(selected.id, makeTexture(selected));
    const texture = textures.get(selected.id),
      data = pixels.data,
      r = selected.ring ? 47 : 76;
    const ce = Math.cos(tilt),
      se = Math.sin(tilt),
      cr = Math.cos(angle),
      sr = Math.sin(angle);
    data.fill(0);
    for (const p of projection(r)) {
      const yy = p.ny * ce + p.nz * se,
        zz = p.nz * ce - p.ny * se;
      const xx = p.nx * cr - zz * sr,
        z2 = p.nx * sr + zz * cr;
      const u = (((Math.atan2(z2, xx) / (Math.PI * 2) + 1) % 1) * TW) | 0;
      const v = Math.min(
        TH - 1,
        ((Math.asin(Math.max(-1, Math.min(1, yy))) / Math.PI + 0.5) * TH) | 0,
      );
      const offset = (v * TW + u) * 3,
        light = selected.kind === "star" ? 0.85 + 0.15 * p.nz : p.light;
      data[p.offset] = texture[offset] * light;
      data[p.offset + 1] = texture[offset + 1] * light;
      data[p.offset + 2] = texture[offset + 2] * light;
      data[p.offset + 3] = p.alpha;
    }
    globeCtx.clearRect(0, 0, GS, GS);
    globeCtx.putImageData(pixels, 0, 0);
    if (selected.ring) {
      globeCtx.strokeStyle = "#d7c295aa";
      globeCtx.lineWidth = 8;
      globeCtx.beginPath();
      globeCtx.ellipse(100, 100, 85, 23, -0.3, 0, Math.PI);
      globeCtx.stroke();
      globeCtx.strokeStyle = "#d7c29555";
      globeCtx.lineWidth = 4;
      globeCtx.beginPath();
      globeCtx.ellipse(100, 100, 77, 20, -0.3, Math.PI, Math.PI * 2);
      globeCtx.stroke();
    }
  }

  planets.forEach((body) => {
    const ratio = body.diameter / byId.get("earth").diameter;
    const row = document.createElement("div");
    row.className = "size-row";
    row.innerHTML = `<span>${body.name}</span><div class="bar" aria-hidden="true"><i style="--scale:${body.diameter / byId.get("jupiter").diameter};--color:${body.color}"></i></div><span>${number(ratio)}×</span>`;
    $("bars").append(row);
  });
  const lightTimes = [193, 360, 499, 760, 2595, 4783, 9577, 14994];
  const laneBars = [],
    laneLabels = [];
  function formatTime(seconds) {
    const s = Math.floor(seconds),
      hours = Math.floor(s / 3600),
      minutes = Math.floor((s % 3600) / 60);
    return hours
      ? `${hours} sa ${minutes} dk`
      : minutes
        ? `${minutes} dk ${s % 60} sn`
        : `${s} sn`;
  }
  planets.forEach((body, index) => {
    const lane = document.createElement("div");
    lane.className = "light-lane";
    lane.innerHTML = `<span>${body.name}</span><div class="bar" aria-hidden="true"><i style="--scale:0"></i></div><b>${formatTime(lightTimes[index])}</b>`;
    $("lanes").append(lane);
    laneBars.push(lane.querySelector("i"));
    laneLabels.push(lane.querySelector("b"));
  });
  function drawRace() {
    const elapsed = Math.min(14994, raceElapsed);
    lightTimes.forEach((seconds, index) => {
      laneBars[index].style.setProperty(
        "--scale",
        Math.min(1, elapsed / seconds),
      );
      laneLabels[index].classList.toggle("arrived", elapsed >= seconds);
    });
    const label = formatTime(elapsed);
    if (label !== raceLastText) {
      $("rt").textContent = label;
      raceLastText = label;
    }
    if (elapsed >= 14994) {
      raceRunning = false;
      $("go").disabled = false;
      $("go").innerHTML = `Yeniden gönder ${arrowIcon}`;
      $("race-status").textContent =
        "Işık Neptün’e ulaştı. Yolculuk yaklaşık 4 saat 10 dakika sürdü.";
    }
  }
  $("go").addEventListener("click", () => {
    raceElapsed = reduced ? 14994 : 0;
    raceRunning = !reduced;
    $("go").disabled = !reduced;
    $("race-status").textContent = "Işık yolculuğu başladı.";
    drawRace();
    requestDraw();
  });
  document.querySelectorAll("[data-select]").forEach((button) =>
    button.addEventListener("click", () => {
      view = "solar";
      selectBody(button.dataset.select);
      $("model").scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
      orbit.focus({ preventScroll: true });
    }),
  );
  const dialog = $("lb");
  let opener = null;
  document.querySelectorAll(".zb").forEach((button) =>
    button.addEventListener("click", () => {
      opener = button;
      const image = button.querySelector("img");
      dialog.querySelector("img").src =
        image.dataset.full || image.currentSrc || image.src;
      dialog.querySelector("img").alt = image.alt;
      dialog.querySelector("p").textContent = button
        .closest("figure")
        .querySelector("figcaption").innerText;
      dialog.showModal();
      document.body.classList.add("modal-open");
      $("lbx").focus();
    }),
  );
  $("lbx").addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    // The image dialog has one interactive control. Keep Tab within it,
    // including browsers that otherwise transfer focus to browser chrome.
    if (event.key === "Tab") {
      event.preventDefault();
      $("lbx").focus();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus({ preventScroll: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    } else requestDraw();
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === orbit) orbitVisible = entry.isIntersecting;
        if (entry.target === globe) {
          globeVisible = entry.isIntersecting;
          globeDirty = true;
        }
        if (entry.target === $("isik")) raceVisible = entry.isIntersecting;
      });
      requestDraw();
    },
    { threshold: 0 },
  );
  observer.observe(orbit);
  observer.observe(globe);
  observer.observe($("isik"));
  new ResizeObserver((entries) => size(entries[0].contentRect)).observe(orbit);
  selectBody("earth", false);
})();
