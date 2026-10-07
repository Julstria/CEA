// Cápsulas Docentes CEA — lógica de la página
// El contenido de las cápsulas y los enlaces de video están en assets/js/data.js
// El dibujo de cada guía está en assets/js/guide.js

const $ = id => document.getElementById(id);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const NIVELES = ["Básico", "Intermedio", "Avanzado"];
const ESTADOS = [["nv", "Pendientes"], ["v", "Vistas"], ["vid", "Con video"]];

// Convierte enlaces de YouTube/Vimeo en enlaces para incrustar
function embedUrl(u) {
  if (!u) return "";
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return "https://www.youtube-nocookie.com/embed/" + m[1];
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return "https://player.vimeo.com/video/" + m[1];
  return "";
}

// Progreso personal (solo en el navegador de cada docente)
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
let seen = store.get("cea-seen", {});
let checks = store.get("cea-checks", {});
const seenCount = () => CAPS.filter(c => seen[c.n]).length;

const st = { ruta: "", nivel: "", estado: "", q: "" };
const HASH = { fundamentos: 0, actividades: 1, gestion: 2, ia: 3 };

const DL = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';
const ARROW = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
const BACK = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
const CHECK = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const PLAY = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/></svg>';

/* ---------- Avance ---------- */
function renderProgress() {
  const n = seenCount();
  $("sSeen").textContent = n; $("sTotal").textContent = CAPS.length;
  $("pgBar").setAttribute("aria-valuenow", n); $("pgBar").setAttribute("aria-valuemax", CAPS.length);
  $("pgBar").firstElementChild.style.width = (n / CAPS.length * 100) + "%";
  const next = CAPS.find(c => !seen[c.n]);
  $("pgNext").innerHTML = next
    ? `<button class="link-btn strong" type="button" data-open="${next.n}">Continuar con la cápsula ${next.n}: ${esc(next.title)} ${ARROW}</button>`
    : "¡Completaste todas las cápsulas!";
  $("ctaStart").textContent = n && next ? `Continuar con la cápsula ${next.n}` : "Empezar por la cápsula 01";
  $("ctaStart").dataset.open = next ? next.n : "01";
}

/* ---------- Rutas ---------- */
function renderRoutes() {
  $("routes").innerHTML = RUTAS.map((r, i) => {
    const caps = CAPS.filter(c => c.ruta === r.k);
    const done = caps.filter(c => seen[c.n]).length;
    return `<article class="route r-${r.key}">
      <div class="route-top"><span class="route-n">Ruta ${i + 1}</span><span class="route-c">${done}/${caps.length} vistas</span></div>
      <h3>${esc(r.k)}</h3><p>${esc(r.d)}</p>
      <ol class="route-list">${caps.map(c => `<li><button type="button" data-open="${c.n}"><span class="rl-n">${c.n}</span><span class="rl-t">${esc(c.title)}</span>${seen[c.n] ? `<span class="rl-ok" aria-label="vista">${CHECK}</span>` : ""}</button></li>`).join("")}</ol>
      <button class="btn btn-soft" type="button" data-ruta="${esc(r.k)}">Ver la ruta en el catálogo ${ARROW}</button>
    </article>`;
  }).join("");
}

/* ---------- Filtros ---------- */
function chip(group, val, text, on) {
  return `<button type="button" class="chip${on ? " on" : ""}" data-g="${group}" data-v="${esc(val)}" aria-pressed="${on}">${esc(text)}</button>`;
}
function renderFilters() {
  $("fRuta").innerHTML = chip("ruta", "", "Todas", !st.ruta) + RUTAS.map(r => chip("ruta", r.k, r.k, st.ruta === r.k)).join("");
  $("fNivel").innerHTML = chip("nivel", "", "Todos", !st.nivel) + NIVELES.map(n => chip("nivel", n, n, st.nivel === n)).join("");
  $("fEstado").innerHTML = chip("estado", "", "Todas", !st.estado) + ESTADOS.map(([v, t]) => chip("estado", v, t, st.estado === v)).join("");
}

/* ---------- Catálogo ---------- */
function filtered() {
  const q = norm(st.q.trim());
  return CAPS.filter(c => {
    const hay = norm(`${c.n} ${c.title} ${c.sub} ${c.objetivo} ${c.pasos.join(" ")}`);
    return (!st.ruta || c.ruta === st.ruta) && (!st.nivel || c.nivel === st.nivel) && (!q || hay.includes(q)) &&
      (!st.estado || (st.estado === "v" && seen[c.n]) || (st.estado === "nv" && !seen[c.n]) || (st.estado === "vid" && VIDEOS[c.n]));
  });
}
function renderGrid() {
  const list = filtered();
  const any = st.ruta || st.nivel || st.estado || st.q;
  $("count").textContent = any ? `${list.length} de ${CAPS.length} cápsulas coinciden` : `${CAPS.length} cápsulas`;
  $("reset").hidden = !any;
  $("grid").innerHTML = list.length ? list.map(c => `
    <article class="card r-${rutaKey(c.ruta)}">
      <div class="card-top"><span class="card-n">${c.n}</span>
        <span class="card-tags">${seen[c.n] ? `<span class="tag tag-ok">${CHECK}Vista</span>` : ""}${VIDEOS[c.n] ? `<span class="tag">${PLAY}Video</span>` : ""}</span></div>
      <p class="card-r">${esc(c.ruta)}</p>
      <h3><button type="button" class="card-link" data-open="${c.n}">${esc(c.title)}</button></h3>
      ${c.sub ? `<p class="card-sub">${esc(c.sub)}</p>` : ""}
      <p class="card-obj">${esc(c.objetivo)}</p>
      <ul class="card-meta"><li>${esc(c.nivel)}</li><li>${esc(c.duracion)}</li><li>${c.pasos.length} pasos</li></ul>
      <div class="card-act">
        <button type="button" class="btn btn-pri btn-sm" data-open="${c.n}">Abrir guía</button>
        <a class="btn btn-line btn-sm" href="${docPath(c, "pdf")}" download aria-label="Descargar PDF de la cápsula ${c.n}">${DL}PDF</a>
        <a class="btn btn-line btn-sm" href="${docPath(c, "docx")}" download aria-label="Descargar Word de la cápsula ${c.n}">${DL}Word</a>
      </div>
    </article>`).join("") : `<div class="empty"><p>No hay cápsulas con esos filtros.</p><button class="btn btn-soft" type="button" data-reset>Quitar filtros</button></div>`;
}
function renderDownloads() {
  $("dlRows").innerHTML = CAPS.map(c => `<tr class="r-${rutaKey(c.ruta)}">
    <th scope="row"><span class="dl-n">${c.n}</span>${esc(c.title)}</th>
    <td><span class="dot"></span>${esc(c.ruta)}</td>
    <td><a href="${docPath(c, "pdf")}" download aria-label="PDF de la cápsula ${c.n}">${DL}PDF</a></td>
    <td><a href="${docPath(c, "docx")}" download aria-label="Word de la cápsula ${c.n}">${DL}Word</a></td></tr>`).join("");
}
function render() { renderProgress(); renderRoutes(); renderFilters(); renderGrid(); }

/* ---------- Lector de guía ---------- */
let cur = null, lastFocus = null;
function openCap(n, push = true) {
  const c = CAPS.find(x => x.n === n); if (!c) return;
  cur = c;
  const R = $("reader");
  R.className = `reader r-${rutaKey(c.ruta)}`;
  $("rK").textContent = `Cápsula ${c.n} · Ruta ${rutaIdx(c.ruta) + 1}: ${c.ruta}`;
  $("rTitle").textContent = c.title;
  $("rSub").textContent = c.sub; $("rSub").hidden = !c.sub;
  $("rMeta").innerHTML = guideMeta(c);
  $("rActions").innerHTML = actionsHtml(c);
  $("rToc").innerHTML = `<p>En esta guía:</p><ul>${["¿Qué lograrás?", ...c.secciones.map(s => s.h)].map(h => `<li><a href="#${secId(c.n, h === "¿Qué lograrás?" ? "objetivo" : h)}">${esc(h)}</a></li>`).join("")}</ul>`;
  const emb = embedUrl(VIDEOS[n]);
  $("rVideo").innerHTML = emb
    ? `<iframe src="${emb}" title="Video de la cápsula ${n}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
    : VIDEOS[n] ? `<a class="btn btn-pri" href="${esc(VIDEOS[n])}" target="_blank" rel="noopener">${PLAY}Ver el video de la cápsula</a>` : "";
  $("rVideo").hidden = !VIDEOS[n];
  $("rGuide").innerHTML = renderGuide(c);
  $("rGuide").querySelectorAll("[data-ck]").forEach(el => { el.checked = !!checks[el.dataset.ck]; });
  const i = CAPS.indexOf(c), prev = CAPS[i - 1], next = CAPS[i + 1];
  $("rEnd").innerHTML = `
    <div class="r-done"><p>¿Terminaste de revisar esta cápsula?</p>${actionsHtml(c)}</div>
    <nav class="r-nav" aria-label="Otras cápsulas">
      ${prev ? `<button type="button" class="r-nav-b" data-open="${prev.n}">${BACK}<span><small>Anterior</small>${prev.n} · ${esc(prev.title)}</span></button>` : "<span></span>"}
      ${next ? `<button type="button" class="r-nav-b nx" data-open="${next.n}"><span><small>Siguiente</small>${next.n} · ${esc(next.title)}</span>${ARROW}</button>` : ""}
    </nav>`;
  if (R.hidden) { lastFocus = document.activeElement; R.hidden = false; document.body.classList.add("locked"); }
  $("rScroll").scrollTop = 0;
  $("rClose").focus();
  if (push) history.replaceState(null, "", `#capsula-${n}`);
}
function actionsHtml(c) {
  return `<div class="r-btns">
    <button type="button" class="btn ${seen[c.n] ? "btn-done" : "btn-pri"}" data-seen="${c.n}" aria-pressed="${!!seen[c.n]}">${CHECK}${seen[c.n] ? "Vista" : "Marcar como vista"}</button>
    <a class="btn btn-line" href="${docPath(c, "pdf")}" download>${DL}PDF</a>
    <a class="btn btn-line" href="${docPath(c, "docx")}" download>${DL}Word</a></div>`;
}
function closeReader() {
  if ($("reader").hidden) return;
  $("reader").hidden = true; $("rVideo").innerHTML = ""; document.body.classList.remove("locked");
  history.replaceState(null, "", location.pathname + location.search);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ---------- Eventos ---------- */
document.addEventListener("click", e => {
  const o = e.target.closest("[data-open]");
  if (o) { openCap(o.dataset.open); return; }
  const ch = e.target.closest(".chip");
  if (ch) { st[ch.dataset.g] = ch.dataset.v; renderFilters(); renderGrid(); return; }
  const r = e.target.closest("[data-ruta]");
  if (r) { st.ruta = r.dataset.ruta; renderFilters(); renderGrid(); $("capsulas").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
  if (e.target.closest("[data-reset]") || e.target.id === "reset") { resetFilters(); return; }
  const s = e.target.closest("[data-seen]");
  if (s) {
    const n = s.dataset.seen; seen[n] = !seen[n]; store.set("cea-seen", seen);
    const inEnd = !!s.closest(".r-done");
    $("rActions").innerHTML = actionsHtml(cur);
    document.querySelector(".r-done .r-btns").outerHTML = actionsHtml(cur);
    document.querySelector(`${inEnd ? ".r-done" : "#rActions"} [data-seen]`).focus();
    toast(seen[n] ? `Cápsula ${n} marcada como vista` : `Cápsula ${n} marcada como pendiente`);
    render(); return;
  }
  const cp = e.target.closest("[data-copy]");
  if (cp) {
    const txt = $(cp.dataset.copy).textContent;
    const ok = () => { cp.classList.add("done"); cp.lastElementChild.textContent = "Copiado"; toast("Prompt copiado. Pégalo en tu herramienta de IA."); setTimeout(() => { cp.classList.remove("done"); cp.lastElementChild.textContent = "Copiar"; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, () => fallbackCopy(txt, ok)); else fallbackCopy(txt, ok);
    return;
  }
  const toc = e.target.closest(".r-toc a");
  if (toc) { e.preventDefault(); const t = document.querySelector(toc.getAttribute("href")); if (t) t.scrollIntoView({ block: "start" }); }
});
function fallbackCopy(txt, ok) {
  const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
  try { document.execCommand("copy"); ok(); } catch (e) {} a.remove();
}
document.addEventListener("change", e => {
  if (e.target.dataset.ck) { checks[e.target.dataset.ck] = e.target.checked; store.set("cea-checks", checks); }
});
function resetFilters() {
  Object.assign(st, { ruta: "", nivel: "", estado: "", q: "" }); $("q").value = ""; renderFilters(); renderGrid();
}
$("q").addEventListener("input", e => { st.q = e.target.value; renderGrid(); });
$("rClose").onclick = closeReader;
$("reader").addEventListener("click", e => { if (e.target.id === "reader") closeReader(); });
document.addEventListener("keydown", e => {
  if ($("reader").hidden) return;
  if (e.key === "Escape") closeReader();
  if (e.key === "Tab") { // mantiene el foco dentro del lector
    const f = [...$("reader").querySelectorAll("a[href],button:not([disabled]),input,iframe")].filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
$("theme").onclick = () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  r.dataset.theme = dark ? "light" : "dark";
  store.set("cea-theme", r.dataset.theme);
};
(() => { const t = store.get("cea-theme", ""); if (t) document.documentElement.dataset.theme = t; })();

// Enlaces directos: #fundamentos, #actividades, #gestion, #ia o #capsula-05
function fromHash() {
  const h = location.hash.slice(1);
  if (HASH[h] !== undefined) { st.ruta = RUTAS[HASH[h]].k; render(); setTimeout(() => $("capsulas").scrollIntoView(), 0); }
  const m = h.match(/^capsula-(\d\d)$/);
  if (m) openCap(m[1], false);
}

renderDownloads();
render();
fromHash();
window.addEventListener("hashchange", fromHash);
