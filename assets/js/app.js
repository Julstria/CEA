// Cápsulas Docentes CEA — lógica de la página
// Los datos de las cápsulas y los enlaces de video están en assets/js/data.js

const RUTAS = [
  { k: "Fundamentos del aula virtual", d: "Ingresa, organiza y publica contenidos" },
  { k: "Actividades y evaluación", d: "Tareas, foros, cuestionarios y calificación" },
  { k: "Gestión y seguimiento", d: "Rutas, seguimiento y apertura del curso" },
  { k: "IA para la docencia", d: "Diseña, ejemplifica y adapta con IA" }
];

const $ = id => document.getElementById(id);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const slug = c => `Capsula_${c.n}_${c.title.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
const pdfPath = c => `pdf/${slug(c)}.pdf`;

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
let seen = {};
try { seen = JSON.parse(localStorage.getItem("cea-seen") || "{}"); } catch (e) {}
const save = () => { try { localStorage.setItem("cea-seen", JSON.stringify(seen)); } catch (e) {} };

const st = { ruta: "", q: "", nivel: "", estado: "" };

// Permite abrir una ruta desde la URL: index.html#ia, #fundamentos, #actividades, #gestion
const HASH = { fundamentos: 0, actividades: 1, gestion: 2, ia: 3 };
if (location.hash && HASH[location.hash.slice(1)] !== undefined) st.ruta = RUTAS[HASH[location.hash.slice(1)]].k;

function renderRoutes() {
  $("routes").innerHTML = RUTAS.map((r, i) => {
    const n = CAPS.filter(c => c.ruta === r.k).length;
    return `<div class="route ${st.ruta === r.k ? "on" : ""}" data-r="${r.k}" tabindex="0" role="button" aria-pressed="${st.ruta === r.k}">
      <div class="num">RUTA ${i + 1} · ${n} CÁPSULAS</div><h3>${r.k}</h3><p>${r.d}</p></div>`;
  }).join("");
  document.querySelectorAll(".route").forEach(el => {
    const toggle = () => { st.ruta = st.ruta === el.dataset.r ? "" : el.dataset.r; render(); };
    el.onclick = toggle;
    el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
  });
}

function render() {
  renderRoutes();
  const q = norm(st.q);
  const list = CAPS.filter(c => {
    const hay = norm(`${c.title} ${c.sub} ${c.objetivo} ${c.pasos.join(" ")}`);
    return (!st.ruta || c.ruta === st.ruta) && (!st.nivel || c.nivel === st.nivel) && (!q || hay.includes(q)) &&
      (!st.estado || (st.estado === "v" && seen[c.n]) || (st.estado === "nv" && !seen[c.n]) || (st.estado === "vid" && VIDEOS[c.n]));
  });
  $("count").textContent = `${list.length} de ${CAPS.length} cápsulas`;
  $("sSeen").textContent = Object.keys(seen).filter(k => seen[k]).length;
  $("grid").innerHTML = list.length ? list.map(c => `
    <article class="card" data-n="${c.n}" tabindex="0">
      <div class="thumb ${c.ia ? "ia" : ""}"><div class="big">${c.n}</div><div class="play"></div>
        <span class="badge ${VIDEOS[c.n] ? "ok" : ""}">${VIDEOS[c.n] ? "Video disponible" : "Video próximamente"}</span>${seen[c.n] ? '<span class="seen">✓ Vista</span>' : ""}</div>
      <div class="cbody"><div class="k">Cápsula ${c.n}</div><h4>${c.title}</h4>${c.sub ? `<div class="sub">${c.sub}</div>` : ""}
        <div class="meta"><span>${c.ruta}</span><span>${c.nivel}</span><span>${c.duracion}</span></div>
        <a class="pdfbtn" href="${pdfPath(c)}" download>⬇ Descargar PDF</a></div>
    </article>`).join("") : `<div class="empty">No hay cápsulas con esos filtros.</div>`;
  document.querySelectorAll(".card").forEach(el => {
    el.onclick = e => { if (!e.target.closest("a")) openCap(el.dataset.n); };
    el.onkeydown = e => { if (e.key === "Enter" && !e.target.closest("a")) openCap(el.dataset.n); };
  });
}

let cur = null;
function openCap(n) {
  const c = CAPS.find(x => x.n === n); cur = c;
  $("mK").textContent = `CÁPSULA ${c.n} · ${c.ruta.toUpperCase()}`;
  $("mT").textContent = c.title;
  const emb = embedUrl(VIDEOS[n]);
  $("mV").innerHTML = emb
    ? `<iframe src="${emb}" title="Video cápsula ${n}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : VIDEOS[n]
      ? `<div>▶ Video de la cápsula ${n}<br><a href="${VIDEOS[n]}" target="_blank" rel="noopener">Ver video</a></div>`
      : `<div>▶<br>Video de la cápsula ${n}<br><small>Próximamente</small></div>`;
  $("mO").innerHTML = `<b>Objetivo:</b> ${c.objetivo}`;
  $("mS").innerHTML = c.pasos.map(s => `<li>${s}</li>`).join("");
  $("mD").href = pdfPath(c);
  $("mSeen").textContent = seen[n] ? "↺ Marcar como no vista" : "✓ Marcar como vista";
  $("modal").classList.add("open");
  document.body.style.overflow = "hidden";
  $("mClose").focus();
}
function closeM() { $("modal").classList.remove("open"); document.body.style.overflow = ""; $("mV").innerHTML = ""; }

$("mClose").onclick = closeM;
$("modal").onclick = e => { if (e.target.id === "modal") closeM(); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeM(); });
$("mSeen").onclick = () => {
  seen[cur.n] = !seen[cur.n]; save();
  $("mSeen").textContent = seen[cur.n] ? "↺ Marcar como no vista" : "✓ Marcar como vista";
  render();
};
$("q").oninput = e => { st.q = e.target.value; render(); };
$("nivel").onchange = e => { st.nivel = e.target.value; render(); };
$("estado").onchange = e => { st.estado = e.target.value; render(); };
$("reset").onclick = () => {
  Object.assign(st, { ruta: "", q: "", nivel: "", estado: "" });
  $("q").value = ""; $("nivel").value = ""; $("estado").value = ""; render();
};
$("theme").onclick = () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  r.dataset.theme = dark ? "light" : "dark";
};

render();
