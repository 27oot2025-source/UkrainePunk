const MapView = {
  data: null,
  world: null,
  view: null,
  selected: "ua",
  bloc: "all",
  fracture: false,
  ready: false,

  async mount(world) {
    this.world = world;
    if (!this.data) {
      const res = await fetch("data/map.json");
      this.data = await res.json();
    }
    if (!this.view) this.view = { x: 0, y: 0, w: this.data.w, h: this.data.h };
    this.draw();
    this.bind();
    this.fillSelect();
    this.renderDossier(this.selected);
    this.ready = true;
  },

  meta(id) {
    return (this.world.countries || {})[id] || {};
  },

  region(id) {
    return this.data.regions.find((r) => r.id === id);
  },

  color(id) {
    const bloc = this.world.blocs[this.meta(id).bloc];
    return bloc ? bloc.color : "#8a8178";
  },

  draw() {
    const svg = document.getElementById("world-svg");
    if (!svg) return;
    const { w, h } = this.data;
    const lines = [];
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * w;
      lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="rgba(255,255,255,.05)" stroke-width="0.4" vector-effect="non-scaling-stroke"/>`);
    }
    for (let i = 1; i < 6; i++) {
      const y = (h / 6) * i;
      lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="0.4" vector-effect="non-scaling-stroke"/>`);
    }
    const paths = this.data.regions.map((r) => {
      const former = r.former ? " is-former" : "";
      return `<path class="country${former}" data-id="${r.id}" d="${r.path}" fill="${this.color(r.id)}" fill-opacity="0.8"/>`;
    }).join("");
    svg.innerHTML = `${lines.join("")}${paths}`;
    this.syncView();
    this.applyFilter();
  },

  syncView() {
    const svg = document.getElementById("world-svg");
    if (!svg) return;
    const v = this.view;
    svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
  },

  clamp() {
    const v = this.view;
    const pad = 40;
    v.w = Math.min(this.data.w * 1.2, Math.max(28, v.w));
    v.h = v.w * (this.data.h / this.data.w);
    v.x = Math.min(this.data.w - v.w + pad, Math.max(-pad, v.x));
    v.y = Math.min(this.data.h - v.h + pad, Math.max(-pad, v.y));
  },

  zoomAt(sx, sy, factor) {
    const v = this.view;
    const nw = v.w / factor;
    const nh = v.h / factor;
    v.x = sx - (sx - v.x) * (nw / v.w);
    v.y = sy - (sy - v.y) * (nh / v.h);
    v.w = nw;
    v.h = nh;
    this.clamp();
    this.syncView();
  },

  clientToSvg(e) {
    const svg = document.getElementById("world-svg");
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return pt.matrixTransform(ctm.inverse());
  },

  zoomTo(id) {
    const r = this.region(id);
    if (!r) return;
    const [x0, y0, x1, y1] = r.bbox;
    let bw = Math.max(18, x1 - x0);
    let bh = Math.max(12, y1 - y0);
    const aspect = this.data.w / this.data.h;
    let w = bw * 3.2;
    let h = bh * 3.2;
    if (w / h < aspect) w = h * aspect;
    else h = w / aspect;
    this.view = { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
    this.clamp();
    this.syncView();
  },

  reset() {
    this.view = { x: 0, y: 0, w: this.data.w, h: this.data.h };
    this.syncView();
  },

  preset(name) {
    const boxes = {
      europe: [500, 120, 180, 97],
      fracture: [540, 40, 460, 200],
      africa: [470, 230, 220, 220],
      asia: [650, 140, 320, 200],
      americas: [20, 80, 320, 360],
      pacific: [780, 180, 220, 220]
    };
    const b = boxes[name];
    if (!b) return;
    this.view = { x: b[0], y: b[1], w: b[2], h: b[3] };
    this.clamp();
    this.syncView();
  },

  applyFilter() {
    const svg = document.getElementById("world-svg");
    if (!svg) return;
    svg.querySelectorAll(".country").forEach((p) => {
      const id = p.dataset.id;
      const meta = this.meta(id);
      const blocOk = this.bloc === "all" || meta.bloc === this.bloc;
      const fracOk = !this.fracture || meta.former || (this.region(id) || {}).former;
      p.classList.toggle("dim", !(blocOk && fracOk));
      p.classList.toggle("active", id === this.selected);
      p.classList.toggle("fracture-hot", this.fracture && (meta.former || (this.region(id) || {}).former));
    });
  },

  select(id, zoom = true) {
    if (!this.region(id)) return;
    this.selected = id;
    this.applyFilter();
    if (zoom) this.zoomTo(id);
    this.renderDossier(id);
    const sel = document.getElementById("country-select");
    if (sel) sel.value = id;
  },

  renderDossier(id) {
    const box = document.getElementById("map-dossier");
    if (!box) return;
    const r = this.region(id);
    const m = this.meta(id);
    const bloc = this.world.blocs[m.bloc] || { name: "Вне блока", color: "#8a8178", motto: "" };
    const ide = this.world.ideologies[m.ideology] || { name: "—", about: "" };
    const flag = m.flag || r.flag || r.iso2 || id;
    const name = m.name || r.name;
    box.innerHTML = `
      <img class="flag-lg" alt="Флаг: ${esc(name)}" src="assets/flags/${esc(flag)}.svg">
      <p class="kicker" style="color:${bloc.color}">${esc(bloc.name)}</p>
      <h2>${esc(name)}</h2>
      <p class="dek" style="font-size:18px">${esc(m.official || "")}</p>
      <div class="row">
        <span class="chip small">${esc(m.status || "государство 2094")}</span>
        <span class="chip small ghost">${esc(ide.name)}</span>
      </div>
      <div class="meta-list mt">
        <span>Столица</span><b>${esc(m.capital || "—")}</b>
        <span>Население</span><b>${esc(m.pop || "—")}</b>
        <span>К Гетьманату</span><b>${esc(m.relation || "—")}</b>
        <span>Идеология</span><b>${esc(ide.name)}</b>
      </div>
      <p class="muted small">${esc(ide.about || "")}</p>
      <div class="prose">${(m.blurb || "").split("\n").map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <div class="row">
        <button class="btn small gold" type="button" data-zoom="${esc(id)}">Приблизить</button>
        <button class="btn small ghost" type="button" data-go="alliances">К альянсам</button>
      </div>`;
  },

  fillSelect() {
    const sel = document.getElementById("country-select");
    if (!sel) return;
    const items = this.data.regions.map((r) => ({ id: r.id, name: (this.meta(r.id).name || r.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
    sel.innerHTML = items.map((i) => `<option value="${esc(i.id)}">${esc(i.name)}</option>`).join("");
    sel.value = this.selected;
  },

  search(q) {
    q = q.trim().toLowerCase();
    if (!q) return;
    const hit = this.data.regions.find((r) => {
      const name = (this.meta(r.id).name || r.name || "").toLowerCase();
      const off = (this.meta(r.id).official || "").toLowerCase();
      return name.includes(q) || off.includes(q) || r.id.includes(q);
    });
    if (hit) this.select(hit.id, true);
  },

  bind() {
    const svg = document.getElementById("world-svg");
    const vp = document.getElementById("map-viewport");
    if (!svg || svg.dataset.bound) {
      this.applyFilter();
      return;
    }
    svg.dataset.bound = "1";
    const tip = document.getElementById("map-tip");
    let drag = null;
    svg.addEventListener("pointerdown", (e) => {
      const p = this.clientToSvg(e);
      drag = { x: e.clientX, y: e.clientY, vx: this.view.x, vy: this.view.y, moved: false, id: e.target.dataset?.id || null, sx: p.x, sy: p.y };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", (e) => {
      if (tip && e.target.dataset?.id) {
        const r = this.region(e.target.dataset.id);
        const name = this.meta(e.target.dataset.id).name || r.name;
        tip.hidden = false;
        tip.textContent = name;
        const rect = vp.getBoundingClientRect();
        tip.style.left = `${e.clientX - rect.left}px`;
        tip.style.top = `${e.clientY - rect.top}px`;
      } else if (tip) tip.hidden = true;
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 4) drag.moved = true;
      if (!drag.moved) return;
      const rect = svg.getBoundingClientRect();
      this.view.x = drag.vx - dx * (this.view.w / rect.width);
      this.view.y = drag.vy - dy * (this.view.h / rect.height);
      this.clamp();
      this.syncView();
    });
    svg.addEventListener("pointerup", () => {
      if (drag && !drag.moved && drag.id) this.select(drag.id, false);
      drag = null;
    });
    svg.addEventListener("pointerleave", () => { if (tip) tip.hidden = true; });
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const p = this.clientToSvg(e);
      this.zoomAt(p.x, p.y, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    }, { passive: false });
    vp.addEventListener("click", (e) => {
      const z = e.target.closest("[data-zoom]");
      if (z) this.zoomTo(z.dataset.zoom);
    });
  }
};
