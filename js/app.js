const TRYZUB = `<svg viewBox="0 0 64 80" aria-hidden="true"><path fill="currentColor" d="M30 2h4v12h8v6h-8v8h14v6H34v20h6l4 8h-6l-2 8h-8l-2-8h-6l4-8h6V34H16v-6h14v-8h-8v-6h8V2z"/></svg>`;

const ICONS = {
  portal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 11 12 4l8 7v9H4z"/><path d="M9 20v-6h6v6"/></svg>`,
  chronicle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 4h9l3 3v13H6z"/><path d="M15 4v3h3M8 11h8M8 15h6"/></svg>`,
  state: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M12 12V3M12 12 4 7M12 12l8-5"/></svg>`,
  characters: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3 2.6-4.5 5.5-4.5S14.4 16 15 19"/><circle cx="17" cy="9" r="2.2"/><path d="M16 14.5c2.2.3 3.6 1.6 4.2 4"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.4 2.2 3.6 5 3.6 8s-1.2 5.8-3.6 8c-2.4-2.2-3.6-5-3.6-8S9.6 6.2 12 4z"/></svg>`,
  alliances: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7" cy="8" r="2.4"/><circle cx="17" cy="8" r="2.4"/><circle cx="12" cy="16" r="2.4"/><path d="M9 9.2 10.8 14M15 9.2 13.2 14M9.4 8h5.2"/></svg>`,
  kyiv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h16M6 20V10l3 3 3-6 3 4 3-5v14"/></svg>`,
  tech: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12h8M12 8v8"/></svg>`,
  corps: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h16M6 20V8h5v12M13 20V4h5v16"/></svg>`,
  zone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,
  orbit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-24 12 12)"/></svg>`,
  culture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 18c4-1 6-5 6-14 4 4 6 8 6 14"/><path d="M8 14h8"/></svg>`,
  feed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 6h14M5 12h14M5 18h9"/></svg>`,
  codex: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H5zM19 5h-6a3 3 0 0 0-3 3"/></svg>`,
  shop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 8h16l-1.2 11H5.2z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/></svg>`
};

let WORLD = null;
const state = {
  tab: "portal",
  cart: JSON.parse(localStorage.getItem("tryzub-cart") || "[]"),
  shop: { cat: "Все", q: "" },
  feed: "Все",
  term: []
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function money(n) {
  return `${Number(n).toLocaleString("ru-RU")} ₴q`;
}
function go(tab) {
  location.hash = tab;
}
function productById(id) {
  return CONTENT.products.find((p) => p.id === id);
}

function bootScreen() {
  const el = document.getElementById("boot");
  if (sessionStorage.getItem("tryzub-boot")) {
    el.hidden = true;
    return;
  }
  const lines = [
    "ТРИЗУБ-СЕТЬ  ·  внешний контур",
    "язык оболочки — русский",
    "язык государства — українська",
    "узел — Киев-Неон",
    "дата — четверг, 23 сентября 2094",
    "протокол открыт · патент отклонён",
    "канал стабилен · гетьманат онлайн"
  ];
  el.hidden = false;
  el.innerHTML = `<div class="boot-card">
    <div class="brand-mark" style="width:54px;height:54px;color:var(--gold)">${TRYZUB}</div>
    <h2>ТРИЗУБ</h2>
    <p class="ua">Воля. Зв'язок. Земля.</p>
    <div class="boot-lines">${lines.map((l, i) => `<div style="animation-delay:${i * 0.18}s">${esc(l)}</div>`).join("")}</div>
    <button class="btn gold" id="boot-skip" type="button">Войти в сеть</button>
  </div>`;
  const close = () => {
    sessionStorage.setItem("tryzub-boot", "1");
    el.hidden = true;
  };
  document.getElementById("boot-skip").onclick = close;
  el.addEventListener("click", (e) => { if (e.target === el) close(); });
  setTimeout(close, 2800);
}

function renderNav() {
  document.getElementById("brand-mark").innerHTML = TRYZUB;
  document.getElementById("rail").innerHTML = CONTENT.tabs.map(([id, label]) =>
    `<button type="button" data-tab="${id}" class="${id === state.tab ? "active" : ""}">${ICONS[id] || ""}<span>${esc(label)}</span></button>`
  ).join("");
  const track = CONTENT.ticker.concat(CONTENT.ticker).map((t) => `<span><b>//</b> ${esc(t)}</span>`).join("");
  document.getElementById("ticker").innerHTML = track;
}

function updateCartBtn() {
  const n = state.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cart-btn").textContent = `Корзина · ${n}`;
}

function frame(title, kicker, dek, body) {
  return `<header class="page-head"><p class="kicker">${kicker}</p><h1>${title}</h1>${dek ? `<p class="dek">${dek}</p>` : ""}</header>${body}`;
}

function renderPortal() {
  const chars = CONTENT.characters.slice(0, 5).map((c) => `
    <button class="person" type="button" data-person="${c.id}">
      <img src="${c.image}" alt="${esc(c.name)}">
      <div><em>${esc(c.role)}</em><strong>${esc(c.name)}</strong></div>
    </button>`).join("");
  return `
  <section class="hero">
    <div class="hero-copy">
      <p class="kicker">01 — внешний контур · 23 сентября 2094</p>
      <h1>КИЕВ<br>НЕОН</h1>
      <p class="dek">Воля. Зв'язок. Земля.</p>
      <p class="lead">В этой истории Гетьманат не просил разрешения стать необходимым. Он открыл протокол, удержал землю и научился говорить с осколками на их языке — поэтому оболочка портала русская, а закон государства украинский.</p>
      <div class="row mt">
        <button class="btn gold" type="button" data-go="chronicle">Читать хроники</button>
        <button class="btn ghost" type="button" data-go="map">Карта мира</button>
        <button class="btn ghost" type="button" data-go="shop">Лавка узла</button>
      </div>
      <div class="pillars">
        <div class="pillar frame"><em>ЭНЕРГИЯ</em><strong>Днепр не просит</strong><span class="dim">Микросинтез громад. Свет как экспорт, не как милость.</span></div>
        <div class="pillar frame"><em>СВЯЗЬ</em><strong>Протокол открыт</strong><span class="dim">Mesh, который нельзя купить. Шум узла — часть закона.</span></div>
        <div class="pillar frame"><em>ЗЕМЛЯ</em><strong>Не метафора</strong><span class="dim">Чернозём, Зона, имена. Сноска важнее слогана.</span></div>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/characters/solomiya.jpg" alt="Гетьманка Соломия Витра на фоне ночного Киева">
      <img src="assets/img/scenes/kyiv.png" alt="" onerror="this.remove()">
      <svg class="skyline" viewBox="0 0 600 280" aria-hidden="true">
        <path d="M0 240 H600" stroke="#e8c45c" stroke-width="1" opacity=".5"/>
        <path d="M40 240 V150 H70 V240 M90 240 V110 H130 V80 H150 V240 M180 240 V130 H230 V90 H250 V240 M280 240 V70 H300 V40 H318 V70 H340 V240 M370 240 V120 H420 V240 M450 240 V100 H490 V60 H520 V240" fill="none" stroke="#5aa6ff" stroke-width="2"/>
        <path d="M300 40 L318 18 L336 40" fill="none" stroke="#e8c45c" stroke-width="2"/>
        <circle cx="318" cy="18" r="3" fill="#e8c45c"/>
      </svg>
      <div class="hero-caption">узел Печерск · дождь · mesh 99.2 · гетьманка на месте</div>
    </div>
  </section>
  <div class="grid g-4 mb">
    <div class="stat frame"><b>64.8 млн</b><span>граждан и резидентов Гетьманату</span></div>
    <div class="stat frame"><b>140+</b><span>узлов на протоколе Тризуб</span></div>
    <div class="stat frame"><b>9</b><span>осколков на месте прежней федерации</span></div>
    <div class="stat frame"><b>400</b><span>слэдов крюка в этом сезоне</span></div>
  </div>
  <div class="between mb"><h2>Люди сети</h2><button class="btn ghost small" type="button" data-go="characters">Все досье</button></div>
  <div class="people mb">${chars}</div>
  <hr class="stitch">
  <div class="split">
    <article class="frame prose">
      <p class="kicker">Зачем этот контур</p>
      <h2>Говорить наружу</h2>
      <p>После Разлома русский не исчез. На нём торгуют Волга, греются архивы Серого Сада, спорят в Янтарном узле. Гетьманат публикует внешний контур по-русски не из привычки империи, а из упрямства быть понятым там, где зима ещё политический аргумент.</p>
      <p>Внутри закон, школа и присяга — українською. Если вы ищете лозунг победы над народом, вы не в той сети. Здесь ищут, как республика остаётся республикой, став необходимой половине континента.</p>
      <button class="btn gold" type="button" data-go="state">Устройство Гетьманату</button>
    </article>
    <article class="frame">
      <p class="kicker">Лента узла</p>
      ${CONTENT.news.slice(0, 3).map((n) => `<p><span class="gold small">${esc(n.date)} · ${esc(n.tag)}</span><br><strong>${esc(n.title)}</strong></p>`).join("")}
      <button class="btn ghost small" type="button" data-go="feed">Вся лента</button>
    </article>
  </div>`;
}

function renderChronicle() {
  const items = CONTENT.chronicle.map((e) => `
    <article class="t-item">
      <div class="t-year">${esc(e.year)}</div>
      <div class="t-dot"></div>
      <div class="t-card frame">
        <h3>${esc(e.title)}</h3>
        ${e.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
    </article>`).join("");
  return frame("Хроники", "02 — от памяти к сети", "Альтернативная история, рассказанная так, будто дождь за окном уже 2094-й.", `<div class="timeline">${items}</div>`);
}

function renderState() {
  const votes = JSON.parse(localStorage.getItem("tryzub-poll") || "{}");
  const total = Object.values(votes).reduce((s, n) => s + n, 0) || 1;
  const options = [
    ["protocol", "Открытый протокол"],
    ["grain", "Зерновой резерв"],
    ["orbit", "Честный орбитальный пай"],
    ["zone", "Неприкасаемость Зоны"]
  ];
  const poll = options.map(([id, label]) => {
    const pct = Math.round(((votes[id] || 0) / total) * 100);
    return `<button class="btn ghost poll-opt" type="button" data-vote="${id}">${esc(label)}<div class="poll-bar"><i style="width:${pct}%"></i></div><span class="dim small">${pct}% · локальный сход этого браузера</span></button>`;
  }).join("");
  return frame("Гетьманат", "03 — республика с титулом", "Право писала Рада. Имя взяли из степи, чтобы сервер не возомнил себя родиной.", `
    <div class="split">
      <div class="prose frame">
        <p>Гетьман избирается на семь лет и может быть отозван. В мирное время это подпись. В час обрыва mesh — временный узел командования, и каждый такой час потом читает Суд протокола вслух.</p>
        <p>Соломия Витра занимает срок с 2091-го. Она не на деньгах и не на орбитальных ангарах. Её можно встретить пешком между Печерском и Подолом, если дождь честный.</p>
        <div class="row"><button class="btn gold" type="button" data-person="solomiya">Досье гетьманки</button></div>
      </div>
      <div class="frame">
        <p class="kicker">Контур власти</p>
        <div class="meta-list">
          <span>Рада сетей</span><b>закон, бюджет, отзыв</b>
          <span>Гетьман</span><b>подпись и час обрыва</b>
          <span>Суд протокола</span><b>выше оферты</b>
          <span>Орден аудита</span><b>смотрит на Липки</b>
          <span>Сечь</span><b>улица с журналом</b>
          <span>Громады</span><b>земля и реактор</b>
        </div>
      </div>
    </div>
    <div class="grid g-3 mt">
      ${CONTENT.principles.map(([t, d]) => `<article class="frame"><h3>${esc(t)}</h3><p class="muted">${esc(d)}</p></article>`).join("")}
    </div>
    <div class="frame mt">
      <p class="kicker">Сход внешнего контура</p>
      <h3>Что стеречь в 2095-м?</h3>
      <p class="dim small">Голос остаётся в вашем браузере. Рада его не видит — и это тоже принцип.</p>
      ${poll}
    </div>`);
}

function renderCharacters() {
  const cards = CONTENT.characters.map((c) => `
    <button class="person" type="button" data-person="${c.id}">
      <img src="${c.image}" alt="Портрет: ${esc(c.name)}, ${esc(c.role)}">
      <div><em>${esc(c.faction)}</em><strong>${esc(c.name)}</strong><span class="dim small">${esc(c.role)}</span></div>
    </button>`).join("");
  return frame("Персонажи", "04 — лица, не функции", "Десять человек, через которых сеть становится биографией. Портреты — 9:16, как досье смены.", `<div class="people">${cards}</div>`);
}

function openPerson(id) {
  const c = CONTENT.characters.find((x) => x.id === id);
  if (!c) return;
  openDrawer(`
    <p class="kicker">${esc(c.faction)}</p>
    <div class="dossier">
      <img src="${c.image}" alt="${esc(c.name)}">
      <div>
        <h2>${esc(c.name)}</h2>
        <p class="gold">${esc(c.role)}</p>
        <p class="quote">«${esc(c.quote)}»</p>
        <div class="meta-list">
          <span>Возраст</span><b>${esc(c.age)}</b>
          <span>Откуда</span><b>${esc(c.origin)}</b>
        </div>
        <div class="prose mt">${c.bio.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      </div>
    </div>`);
}

function renderMapPage() {
  const blocs = Object.entries(WORLD.blocs);
  const legend = blocs.map(([id, b]) => `<button class="chip small" type="button" data-bloc="${id}"><i class="swatch" style="background:${b.color}"></i>${esc(b.name)}</button>`).join("");
  return frame("Карта мира", "05 — 23 сентября 2094", "Каждая страна — флаг, идеология и альянс. Осколки Разлома разрезаны по меридианному протоколу 2031-го: берега живые, границы договора — прямые. Флаги нынешних государств — Flag Icons (MIT); флаги осколков нарисованы для этого мира.", `
    <div class="map-layout">
      <div class="map-stage">
        <div class="map-tools">
          <input class="search" id="map-search" placeholder="Найти страну или столицу" aria-label="Поиск страны">
          <select class="search" id="country-select" aria-label="Список стран"></select>
          <button class="btn small" type="button" data-preset="europe">Европа</button>
          <button class="btn small" type="button" data-preset="fracture">Осколки</button>
          <button class="btn small" type="button" data-preset="africa">Африка</button>
          <button class="btn small" type="button" data-preset="asia">Азия</button>
          <button class="btn small" type="button" data-preset="americas">Америка</button>
          <button class="btn small" type="button" data-preset="pacific">Тихий океан</button>
          <button class="btn small" type="button" id="zoom-in">+</button>
          <button class="btn small" type="button" id="zoom-out">−</button>
          <button class="btn small ghost" type="button" id="map-reset">Мир</button>
          <button class="btn small" type="button" id="fracture-toggle">Разлом</button>
        </div>
        <div class="legend" id="bloc-legend">
          <button class="chip small gold" type="button" data-bloc="all">Все блоки</button>
          ${legend}
        </div>
        <div class="map-viewport" id="map-viewport">
          <div class="map-tip" id="map-tip" hidden></div>
          <svg id="world-svg" role="img" aria-label="Интерактивная карта мира 2094"></svg>
        </div>
      </div>
      <aside class="frame dossier-panel" id="map-dossier"><p class="dim">Загрузка контура…</p></aside>
    </div>`);
}

function renderAlliances() {
  const cards = Object.entries(WORLD.blocs).map(([id, b]) => {
    const members = Object.values(WORLD.countries).filter((c) => c.bloc === id);
    const flags = members.slice(0, 18).map((c) => `<img src="assets/flags/${esc(c.flag)}.svg" alt="${esc(c.name)}" title="${esc(c.name)}" style="width:42px;height:32px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,.12)">`).join("");
    return `<article class="frame">
      <p class="kicker" style="color:${b.color}">${esc(b.motto)}</p>
      <h3>${esc(b.name)}</h3>
      <p class="muted">${esc(b.about)}</p>
      <p class="dim small">Опорный узел: ${esc(b.leader)} · ${members.length} полит. на карте</p>
      <div class="row mt">${flags}</div>
    </article>`;
  }).join("");
  const opts = Object.values(WORLD.countries).sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  const ideas = Object.values(WORLD.ideologies).map((i) => `<article class="frame"><h3>${esc(i.name)}</h3><p class="muted">${esc(i.about)}</p></article>`).join("");
  return frame("Альянсы", "06 — блоки и идеологии", "Мир 2094-го не двуполярный. Он кольцевой: каждый пояс думает, что держит небо.", `
    <div class="grid g-2">${cards}</div>
    <div class="frame mt">
      <p class="kicker">Сверить два берега</p>
      <h3>Какой между ними договор?</h3>
      <div class="row mt">
        <select class="search" id="rel-a">${opts}</select>
        <select class="search" id="rel-b">${opts}</select>
        <button class="btn gold" type="button" id="rel-go">Сверить</button>
      </div>
      <p id="rel-out" class="lead mt">Выберите две страны. Сеть помнит блоки, договоры и холод.</p>
    </div>
    <h2 class="mt">Идеологии</h2>
    <div class="grid g-3 mt">${ideas}</div>`);
}

function renderKyiv() {
  const zones = [
    [80, 250, 150, 120, "podil", "#e8c45c"],
    [250, 40, 120, 150, "pechersk", "#5aa6ff"],
    [390, 70, 130, 110, "lypky", "#ef4b5a"],
    [430, 220, 150, 140, "left", "#67e4d4"],
    [250, 210, 140, 90, "obolon", "#8fd18a"],
    [40, 80, 120, 90, "solomia", "#ffb15a"],
    [210, 150, 70, 70, "trukhaniv", "#f4efe6"],
    [40, 390, 160, 80, "akadem", "#c9b6ff"],
    [240, 390, 180, 80, "darnytsia", "#e7a15a"]
  ];
  const svg = zones.map(([x, y, w, h, id, fill], i) => {
    const d = CONTENT.districts.find((z) => z.id === id);
    return `<g class="zone-hit" data-district="${id}" transform="translate(${x} ${y})">
      <rect width="${w}" height="${h}" rx="16" fill="${fill}" opacity="0.85"/>
      <text x="12" y="28" fill="#140e06" font-size="13" font-family="Manrope, sans-serif">${esc(d.name)}</text>
    </g>`;
  }).join("");
  return frame("Киев-Неон", "07 — город на восемнадцать миллионов", "Не столица империи. Узел, который согласился быть видимым.", `
    <div class="city">
      <div class="frame">
        <svg viewBox="0 0 620 500" role="img" aria-label="Схема районов Киева-Неона">
          <rect width="620" height="500" fill="#0c1628"/>
          <path d="M300 0 C280 80 340 120 300 180 C250 250 360 300 310 380 C280 430 340 470 320 500" fill="none" stroke="#5aa6ff" stroke-width="18" opacity=".55"/>
          ${svg}
        </svg>
        <p class="dim small">Река — синяя лента. Нажмите район.</p>
      </div>
      <article class="frame" id="district-card">
        <p class="kicker">Подол-Низ</p>
        <h2>Подол-Низ</h2>
        <p class="gold">Рынки, бандура, ночной аудит Сечи.</p>
        <p class="muted">${esc(CONTENT.districts[0].text)}</p>
      </article>
    </div>
    <div class="grid g-3 mt">
      ${CONTENT.districts.map((d) => `<button class="frame" type="button" data-district="${d.id}" style="text-align:left"><p class="cat">${esc(d.name)}</p><strong>${esc(d.line)}</strong></button>`).join("")}
    </div>
    <div class="hero-visual mt" style="min-height:280px">
      <img src="assets/img/scenes/market.png" alt="Ночной рынок Подола" onerror="this.src='assets/img/characters/ostap.jpg'">
      <div class="hero-caption">Подол · живая лавка · глушилки запрещены уставом ночи</div>
    </div>`);
}

function renderTech() {
  const cards = CONTENT.techs.map((t) => `
    <article class="frame">
      <p class="kicker">${esc(t.kicker)}</p>
      <h3>${esc(t.name)}</h3>
      <p class="muted">${esc(t.text)}</p>
      <ul>${t.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </article>`).join("");
  return frame("Технологии", "08 — то, на чём стоит необходимость", "Не магия. Расписание, сноски и право выйти.", `<div class="grid g-2">${cards}</div>
    <div class="hero-visual mt" style="min-height:300px"><img src="assets/img/scenes/fusion.png" alt="Станция Днепр-1" onerror="this.src='assets/img/characters/lina.jpg'"><div class="hero-caption">Днепр-1 · собственность берега, не собор</div></div>`);
}

function renderCorps() {
  const cards = CONTENT.corps.map((c) => `
    <article class="frame">
      <div class="between"><h3>${esc(c.name)}</h3><span class="chip small">${c.rep}</span></div>
      <p class="cat">${esc(c.field)}</p>
      <div class="meter mt"><i style="width:${c.rep}%"></i></div>
      <p class="dim small">доверие улицы, не биржи</p>
      <p class="muted">${esc(c.text)}</p>
      <p><strong>Риск.</strong> <span class="muted">${esc(c.risk)}</span></p>
    </article>`).join("");
  return frame("Корпорации", "09 — богатые, на поводке", "Гетьманат не запретил прибыль. Он запретил ей быть конституцией.", `<div class="grid g-2">${cards}</div>`);
}

function renderZone() {
  return frame("Зона", "10 — мемориал, который умеет измерять", "Сначала имена. Потом прибор. Этот порядок старше любопытства.", `
    <div class="split">
      <div class="hero-visual" style="min-height:420px">
        <img src="assets/img/scenes/zone.png" alt="Рассвет мемориальной Зоны" onerror="this.src='assets/img/characters/marko.jpg'">
        <div class="hero-caption">внутреннее кольцо · туризм закрыт · присяга обязательна</div>
      </div>
      <div class="prose frame">
        <p>Катастрофа 1986-го в этой истории не отменена и не превращена в аттракцион. Статут 2077-го дал Зоне юридическое лицо: могила, лаборатория, запрет на рынок «артефактов».</p>
        <p>Аномалии приборов — часть мира 2094-го. Торговать ими нельзя. Снимать колесо «Чайкой» нельзя. Прийти без имён на языке — значит не прийти.</p>
        <p>Марко Зона пускает новичков только после поклона мемориалу пожарных. Он не романтик. Он сторож.</p>
        <button class="btn gold" type="button" data-person="marko">Досье архивариуса</button>
      </div>
    </div>
    <div class="grid g-3 mt">
      <article class="frame"><h3>Внешнее кольцо</h3><p class="muted">Исследовательские павильоны, дозиметр «Память», ночлег смен. Селфи допустимы, если не закрывают имя на стеле.</p></article>
      <article class="frame"><h3>Внутреннее</h3><p class="muted">Только присяга. Ключ не продаётся в лавке. Нарушение — не «контент», а утрата допуска навсегда.</p></article>
      <article class="frame"><h3>Что нельзя</h3><p class="muted">Сувенир из внутреннего кольца. Шутка в эфире калины. Дрон ниже уставной высоты. Слово «лут».</p></article>
    </div>`);
}

function renderOrbit() {
  return frame("Орбита", "11 — логистика, не покорение", "Крюк над Чёрным морем. Лифт на экваторе. Путать их — дурной тон смены.", `
    <div class="split">
      <div class="prose frame">
        <p>Гетьманат не притворяется экваториальной страной. Поэтому «Колосс» принадлежит лиге: Кения, Нигерия, пайщики. Киев даёт сплав, стекло, энергию и обязуется не голосовать за партнёров их собственным небом.</p>
        <p>Своё небо — крюк «Світанок». Он ловит сани с херсонской гряды. Четырёхсотый слэд сезона сел чисто. Богдан Лев написал в сводке: «норма».</p>
        <div class="row">
          <button class="btn gold" type="button" data-person="bohdan">Инженер крюка</button>
          <button class="btn ghost" type="button" data-go="tech">К технике</button>
        </div>
      </div>
      <div class="hero-visual" style="min-height:360px">
        <img src="assets/img/scenes/skyhook.png" alt="Небесный крюк над морем" onerror="this.src='assets/img/characters/bohdan.jpg'">
        <div class="hero-caption">Світанок · захват, не фейерверк</div>
      </div>
    </div>
    <div class="grid g-3 mt">
      <article class="stat frame"><b>400</b><span>слэдов сезона, без потерянного стекла</span></article>
      <article class="stat frame"><b>3</b><span>столицы следят, чтобы пай не стал троном</span></article>
      <article class="stat frame"><b>0</b><span>разрешённых фейерверков у гряды</span></article>
    </div>`);
}

function renderCulture() {
  const slang = CONTENT.slang.map(([w, d]) => `<article class="slang-item"><h3>${esc(w)}</h3><p class="muted">${esc(d)}</p></article>`).join("");
  return frame("Культура", "12 — орнамент, который спорит", "Мягкая сила, которую нельзя отозвать, не став смешным.", `
    <div class="grid g-2">
      <div>
        <input class="search mb" id="slang-q" placeholder="Искать слово улицы" aria-label="Поиск слэнга">
        <div id="slang-list" class="grid">${slang}</div>
      </div>
      <div>
        <article class="frame mb">
          <p class="kicker">Календарь</p>
          ${CONTENT.holidays.map(([d, t, x]) => `<p><strong>${esc(d)} · ${esc(t)}</strong><br><span class="muted">${esc(x)}</span></p>`).join("")}
        </article>
        <article class="frame">
          <p class="kicker">Стол</p>
          ${CONTENT.dishes.map(([t, d]) => `<p><strong>${esc(t)}</strong> — <span class="muted">${esc(d)}</span></p>`).join("")}
        </article>
      </div>
    </div>`);
}

function renderFeed() {
  const tags = ["Все", ...new Set(CONTENT.news.map((n) => n.tag))];
  const items = CONTENT.news.filter((n) => state.feed === "Все" || n.tag === state.feed).map((n) => `
    <article class="frame">
      <time>${esc(n.date)} · ${esc(n.tag)}</time>
      <div><h3>${esc(n.title)}</h3><p class="muted">${esc(n.text)}</p></div>
    </article>`).join("");
  return frame("Лента", "13 — узел не молчит", "Восемь сводок сентября. Без победных фанфар.", `
    <div class="filters mb">${tags.map((t) => `<button type="button" data-feed="${esc(t)}" class="${state.feed === t ? "on" : ""}">${esc(t)}</button>`).join("")}</div>
    <div class="news">${items}</div>`);
}

function renderCodex() {
  const items = CONTENT.codex.map((c) => `<article class="codex-item" data-codex="${esc(c.t)} ${esc(c.d)}"><h3>${esc(c.t)}</h3><p class="muted">${esc(c.d)}</p></article>`).join("");
  return frame("Кодекс", "14 — короткие определения длинного мира", "Если слово спорит само с собой, скорее всего, оно из этого списка.", `
    <input class="search mb" id="codex-q" placeholder="Поиск по кодексу" aria-label="Поиск по кодексу">
    <div class="grid" id="codex-list">${items}</div>`);
}

function renderShop() {
  const cats = ["Все", ...new Set(CONTENT.products.map((p) => p.cat))];
  const q = state.shop.q.toLowerCase();
  const list = CONTENT.products.filter((p) => (state.shop.cat === "Все" || p.cat === state.shop.cat) && (`${p.name} ${p.blurb} ${p.cat}`.toLowerCase().includes(q)));
  const cards = list.map((p) => `
    <article class="card product">
      <button type="button" class="ph" data-product="${p.id}" aria-label="${esc(p.name)}">
        <img src="${p.image}" alt="${esc(p.name)}" onerror="this.remove()">
      </button>
      <div class="body">
        <span class="cat">${esc(p.cat)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="muted small">${esc(p.blurb)}</p>
        <div class="between">
          <span class="price">${money(p.price)}</span>
          <button class="btn small gold" type="button" data-add="${p.id}">В корзину</button>
        </div>
      </div>
    </article>`).join("");
  return frame("Магазин", "15 — лавка узла Подол", "Гражданские вещи сети. Пластина — чертёж вещи, не глянец Липок: после Ночи корпораций лавка публикует узел, а не обещание. Настоящий паспорт здесь не продаётся. Нейродолг — тоже.", `
    <div class="shop-layout">
      <aside class="side-filters frame">
        <input class="search" id="shop-q" value="${esc(state.shop.q)}" placeholder="Поиск вещи" aria-label="Поиск по лавке">
        ${cats.map((c) => `<button class="chip ${state.shop.cat === c ? "gold" : ""}" type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
        <p class="dim small">${list.length} позиций · доставка «Чайкой» внутри кольца</p>
      </aside>
      <div class="products">${cards || `<p class="frame">Пусто. Сеть не нашла такую вещь.</p>`}</div>
    </div>`);
}

function openProduct(id) {
  const p = productById(id);
  if (!p) return;
  openDrawer(`
    <p class="cat">${esc(p.cat)}</p>
    <div class="ph" style="border-radius:16px;overflow:hidden;margin:8px 0 12px"><img src="${p.image}" alt="${esc(p.name)}" onerror="this.remove()"></div>
    <h2>${esc(p.name)}</h2>
    <p class="price">${money(p.price)}</p>
    <div class="prose">${p.desc.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
    <table class="specs">${p.specs.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>
    <div class="row mt"><button class="btn gold" type="button" data-add="${p.id}">Положить в корзину</button></div>`);
}

function renderTerminal() {
  return frame("Терминал", "16 — сеанс внешнего контура", "Команды сети. Это не корневой доступ и не игрушка для чужих узлов.", `
    <div class="term" id="term">
      <header>tryzub@kyiv-neon:~ · гость внешнего контура</header>
      <div class="term-log" id="term-log"></div>
      <footer><span>₴</span><input id="term-in" aria-label="Команда" autocomplete="off" placeholder="help"></footer>
    </div>`);
}

const RENDER = {
  portal: renderPortal,
  chronicle: renderChronicle,
  state: renderState,
  characters: renderCharacters,
  map: renderMapPage,
  alliances: renderAlliances,
  kyiv: renderKyiv,
  tech: renderTech,
  corps: renderCorps,
  zone: renderZone,
  orbit: renderOrbit,
  culture: renderCulture,
  feed: renderFeed,
  codex: renderCodex,
  shop: renderShop,
  terminal: renderTerminal
};

function openDrawer(html) {
  const root = document.getElementById("drawer");
  root.hidden = false;
  root.innerHTML = `<div class="drawer-back" data-close="1"></div><div class="drawer-panel"><div class="between"><span class="kicker">досье сети</span><button class="btn small ghost" type="button" data-close="1">Закрыть</button></div>${html}</div>`;
}
function closeDrawer() {
  document.getElementById("drawer").hidden = true;
}
function openCart() {
  if (!state.cart.length) {
    openDrawer(`<h2>Корзина пуста</h2><p class="muted">Лавка Подола ждёт. Настоящие документы и петли нейродолга не продаются.</p><button class="btn gold" data-go="shop" type="button">В магазин</button>`);
    return;
  }
  const lines = state.cart.map((i) => {
    const p = productById(i.id);
    return `<div class="cart-line">
      <img src="${p.image}" alt="" onerror="this.remove()">
      <div><strong>${esc(p.name)}</strong><br><span class="dim">${money(p.price)} × ${i.qty}</span></div>
      <button class="btn small ghost" type="button" data-del="${p.id}">убрать</button>
    </div>`;
  }).join("");
  const sum = state.cart.reduce((s, i) => s + productById(i.id).price * i.qty, 0);
  openDrawer(`<h2>Корзина узла</h2>${lines}
    <p class="price mt">Итого ${money(sum)}</p>
    <button class="btn gold" type="button" id="checkout">Оформить в mesh</button>
    <p class="dim small">Оплата вымышленная. Доставка — часть мира, не служба.</p>`);
}
function addToCart(id) {
  const row = state.cart.find((i) => i.id === id);
  if (row) row.qty += 1;
  else state.cart.push({ id, qty: 1 });
  localStorage.setItem("tryzub-cart", JSON.stringify(state.cart));
  updateCartBtn();
}
function checkout() {
  state.cart = [];
  localStorage.setItem("tryzub-cart", "[]");
  updateCartBtn();
  openDrawer(`<p class="kicker">узел Подол принял</p><h2>Заказ в сети</h2><p class="muted">«Чайка» возьмёт слот внутри кольца за шесть часов. За кольцом — речной график Дарницы. Это художественный контур: денег с вас не снимут, пакет не приедет. Приедет только ощущение, что город умеет обещать аккуратно.</p>`);
}

function termPrint(cmd, out) {
  state.term.push({ cmd, out });
  const log = document.getElementById("term-log");
  if (!log) return;
  log.innerHTML = state.term.map((t) => `<div class="cmd">₴ ${esc(t.cmd)}</div><p class="out">${esc(t.out)}</p>`).join("");
  log.scrollTop = log.scrollHeight;
}
function termAnswer(raw) {
  const [cmd, ...rest] = raw.trim().split(/\s+/);
  const arg = rest.join(" ");
  const c = (cmd || "").toLowerCase();
  const help = "Команды: help, status, hetman, protocol, who, slang, price, allies, zone, orbit, date, clear, about, воля";
  const map = {
    help,
    status: "Канал стабилен. Киев-Неон, четверг, 23.09.2094. Mesh 99.2. Дождь — да. Патент на протокол — нет.",
    hetman: "Соломия Витра, срок 2091–2098, если Рада не отзовёт. Воля — это протокол, который нельзя купить.",
    protocol: "Тризуб открыт. Ядро не патентуется. Узел может выйти с архивом. Гармония-4 отклонена.",
    who: CONTENT.characters.map((p) => `${p.name} — ${p.role}`).join("\n"),
    zone: "Сначала имена. Потом дозиметр. Внутреннее кольцо закрыто. Слово «лут» здесь не водится.",
    orbit: "Крюк — не лифт. Колосс — не наш трон. Четырёхсотый слэд сезона: норма.",
    date: "23 сентября 2094, четверг. Внешний контур синхронизирован с дождём.",
    about: "Художественный портал альтернативной истории. Гетьманат вымышлен. Память 1986-го — нет.",
    "воля": "Воля. Зв'язок. Земля.\nЕсли вы это набрали сами, узел считает вас своим на одну минуту.",
    allies: Object.values(WORLD.blocs).map((b) => `${b.name} — ${b.motto}`).join("\n")
  };
  if (!c) return;
  if (c === "clear") { state.term = []; document.getElementById("term-log").innerHTML = ""; return; }
  if (c === "slang") {
    if (!arg) return termPrint(raw, CONTENT.slang.map(([w]) => w).join(", "));
    const hit = CONTENT.slang.find(([w]) => w.includes(arg.toLowerCase()) || arg.toLowerCase().includes(w));
    return termPrint(raw, hit ? `${hit[0]} — ${hit[1]}` : "Нет такого слова. Улица ещё не договорилась.");
  }
  if (c === "price") {
    if (!arg) return termPrint(raw, CONTENT.products.map((p) => `${p.name}: ${money(p.price)}`).join("\n"));
    const hit = CONTENT.products.find((p) => p.name.toLowerCase().includes(arg.toLowerCase()));
    return termPrint(raw, hit ? `${hit.name} — ${money(hit.price)}. ${hit.blurb}` : "В лавке нет. Серый рынок не консультируем.");
  }
  termPrint(raw, map[c] || `Неизвестная команда «${c}». ${help}`);
}

function relationText(a, b) {
  if (a === b) return "Это один и тот же узел. Сверять его с собой — медитация, не дипломатия.";
  const A = WORLD.countries[a];
  const B = WORLD.countries[b];
  if (!A || !B) return "Сеть не видит такую пару.";
  const key = [a, b].sort().join("|");
  if (WORLD.pairs && WORLD.pairs[key]) return `${A.name} и ${B.name}: ${WORLD.pairs[key]}`;
  if (A.bloc === B.bloc && A.bloc !== "nonaligned") {
    const bloc = WORLD.blocs[A.bloc];
    return `${A.name} и ${B.name} сидят в одном контуре — «${bloc.name}». Это не значит, что они не спорят. Это значит, что спор идёт внутри устава, а не через чужой алгоритм. Девиз блока: ${bloc.motto}.`;
  }
  const pair = [A.bloc, B.bloc].sort().join("|");
  const rel = (WORLD.blocRel || {})[pair] || "Нейтральный обмен: порты открыты, клятвы нет, чужие зимы друг другу не отдают.";
  return `${A.name} (${WORLD.blocs[A.bloc]?.name || "вне блока"}) и ${B.name} (${WORLD.blocs[B.bloc]?.name || "вне блока"}). ${rel}`;
}

function showDistrict(id) {
  const d = CONTENT.districts.find((x) => x.id === id);
  const card = document.getElementById("district-card");
  if (!d || !card) return;
  card.innerHTML = `<p class="kicker">район</p><h2>${esc(d.name)}</h2><p class="gold">${esc(d.line)}</p><p class="muted">${esc(d.text)}</p>`;
  document.querySelectorAll(".zone-hit").forEach((el) => el.classList.toggle("on", el.dataset.district === id));
}

function bindPage() {
  const main = document.getElementById("main");
  main.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  main.querySelectorAll("[data-person]").forEach((b) => b.addEventListener("click", () => openPerson(b.dataset.person)));
  main.querySelectorAll("[data-product]").forEach((b) => b.addEventListener("click", () => openProduct(b.dataset.product)));
  main.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); addToCart(b.dataset.add); }));
  main.querySelectorAll("[data-vote]").forEach((b) => b.addEventListener("click", () => {
    const votes = JSON.parse(localStorage.getItem("tryzub-poll") || "{}");
    votes[b.dataset.vote] = (votes[b.dataset.vote] || 0) + 1;
    localStorage.setItem("tryzub-poll", JSON.stringify(votes));
    route();
  }));
  main.querySelectorAll("[data-cat]").forEach((b) => b.addEventListener("click", () => { state.shop.cat = b.dataset.cat; route(); }));
  main.querySelectorAll("[data-feed]").forEach((b) => b.addEventListener("click", () => { state.feed = b.dataset.feed; route(); }));
  main.querySelectorAll("[data-district]").forEach((b) => b.addEventListener("click", () => showDistrict(b.dataset.district)));
  const shopQ = document.getElementById("shop-q");
  if (shopQ) shopQ.addEventListener("input", (e) => { state.shop.q = e.target.value; const pos = e.target.selectionStart; route(); const n = document.getElementById("shop-q"); if (n) { n.focus(); n.selectionStart = n.selectionEnd = pos; } });
  const slang = document.getElementById("slang-q");
  if (slang) slang.addEventListener("input", () => {
    const q = slang.value.toLowerCase();
    document.querySelectorAll(".slang-item").forEach((el) => { el.hidden = q && !el.textContent.toLowerCase().includes(q); });
  });
  const codex = document.getElementById("codex-q");
  if (codex) codex.addEventListener("input", () => {
    const q = codex.value.toLowerCase();
    document.querySelectorAll(".codex-item").forEach((el) => { el.hidden = q && !el.dataset.codex.toLowerCase().includes(q); });
  });
  const tin = document.getElementById("term-in");
  if (tin) {
    const log = document.getElementById("term-log");
    log.innerHTML = state.term.map((t) => `<div class="cmd">₴ ${esc(t.cmd)}</div><p class="out">${esc(t.out)}</p>`).join("");
    if (!state.term.length) termPrint("help", "Сеанс открыт. Наберите help.");
    tin.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = tin.value;
        tin.value = "";
        termAnswer(v);
      }
    });
    tin.focus();
  }
  if (state.tab === "map") {
    MapView.mount(WORLD).then(() => {
      document.getElementById("map-dossier").addEventListener("click", (e) => {
        const z = e.target.closest("[data-zoom]");
        if (z) MapView.zoomTo(z.dataset.zoom);
        const g = e.target.closest("[data-go]");
        if (g) go(g.dataset.go);
      });
      document.getElementById("map-search").addEventListener("keydown", (e) => {
        if (e.key === "Enter") MapView.search(e.target.value);
      });
      document.getElementById("country-select").addEventListener("change", (e) => MapView.select(e.target.value, true));
      document.getElementById("zoom-in").onclick = () => MapView.zoomAt(MapView.view.x + MapView.view.w / 2, MapView.view.y + MapView.view.h / 2, 1.3);
      document.getElementById("zoom-out").onclick = () => MapView.zoomAt(MapView.view.x + MapView.view.w / 2, MapView.view.y + MapView.view.h / 2, 1 / 1.3);
      document.getElementById("map-reset").onclick = () => MapView.reset();
      document.getElementById("fracture-toggle").onclick = (e) => {
        MapView.fracture = !MapView.fracture;
        e.target.classList.toggle("gold", MapView.fracture);
        MapView.applyFilter();
      };
      document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => MapView.preset(b.dataset.preset)));
      document.querySelectorAll("[data-bloc]").forEach((b) => b.addEventListener("click", () => {
        MapView.bloc = b.dataset.bloc;
        document.querySelectorAll("[data-bloc]").forEach((x) => x.classList.toggle("gold", x === b));
        MapView.applyFilter();
      }));
    });
  }
  const rel = document.getElementById("rel-go");
  if (rel) rel.onclick = () => {
    document.getElementById("rel-out").textContent = relationText(document.getElementById("rel-a").value, document.getElementById("rel-b").value);
  };
}

function route() {
  const id = (location.hash || "#portal").replace("#", "") || "portal";
  state.tab = RENDER[id] ? id : "portal";
  document.querySelectorAll("#rail button").forEach((b) => {
    const on = b.dataset.tab === state.tab;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const main = document.getElementById("main");
  main.innerHTML = RENDER[state.tab]();
  main.scrollTop = 0;
  const tabLabel = CONTENT.tabs.find((t) => t[0] === state.tab)?.[1] || "Портал";
  document.title = `${tabLabel} · ТРИЗУБ 2094`;
  bindPage();
  document.getElementById("rail").classList.remove("open");
}

function bindGlobal() {
  document.body.addEventListener("click", (e) => {
    const goBtn = e.target.closest("[data-go]");
    if (goBtn && !e.target.closest("main")) go(goBtn.dataset.go);
    const tab = e.target.closest("#rail [data-tab]");
    if (tab) go(tab.dataset.tab);
    if (e.target.closest("[data-close]")) closeDrawer();
    if (e.target.closest("[data-add]") && e.target.closest(".drawer-panel")) addToCart(e.target.closest("[data-add]").dataset.add);
    if (e.target.closest("[data-del]")) {
      const id = e.target.closest("[data-del]").dataset.del;
      state.cart = state.cart.filter((i) => i.id !== id);
      localStorage.setItem("tryzub-cart", JSON.stringify(state.cart));
      updateCartBtn();
      openCart();
    }
    if (e.target.id === "checkout") checkout();
    if (e.target.closest("[data-person]") && e.target.closest(".drawer-panel")) openPerson(e.target.closest("[data-person]").dataset.person);
  });
  document.getElementById("cart-btn").onclick = openCart;
  document.getElementById("menu-btn").onclick = () => {
    const rail = document.getElementById("rail");
    rail.classList.toggle("open");
    document.getElementById("menu-btn").setAttribute("aria-expanded", rail.classList.contains("open"));
  };
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
  setInterval(() => {
    const el = document.getElementById("mesh-stat");
    if (el) el.textContent = `mesh ${(98.9 + Math.random() * 0.9).toFixed(2)}%`;
  }, 5000);
}

async function init() {
  renderNav();
  bindGlobal();
  updateCartBtn();
  bootScreen();
  try {
    WORLD = await fetch("data/world.json").then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  } catch (err) {
    document.getElementById("main").innerHTML = `<div class="frame"><h2>Контур не собрался</h2><p>Не удалось прочитать data/world.json.</p></div>`;
    return;
  }
  if (!location.hash) location.hash = "portal";
  route();
}
init();
