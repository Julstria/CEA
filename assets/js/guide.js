// Cápsulas Docentes CEA — dibuja el contenido de una guía (lo usan la página y los PDF)

const RUTAS = [
  { k: "Fundamentos del aula virtual", key: "fundamentos", d: "Ingresa, organiza y publica tus primeros contenidos." },
  { k: "Actividades y evaluación", key: "actividades", d: "Crea tareas, foros y cuestionarios, y califica." },
  { k: "Gestión y seguimiento", key: "gestion", d: "Configura rutas, acompaña a tus estudiantes y abre tu curso." },
  { k: "IA para la docencia", key: "ia", d: "Diseña actividades, ejemplos y rúbricas con apoyo de la IA." }
];
const rutaKey = r => (RUTAS.find(x => x.k === r) || RUTAS[0]).key;
const rutaIdx = r => RUTAS.findIndex(x => x.k === r);

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const runs = rs => rs.map(r => r.b ? `<strong>${esc(r.t)}</strong>` : esc(r.t)).join("");
const secId = (n, h) => `c${n}-` + h.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const docPath = c => `pdf/${c.file}.pdf`;

// Iconos (trazos de Lucide, licencia ISC)
const ICON = {
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>'
};
const icon = (n, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

const CALLOUT = {
  tip: { label: "Tip docente", i: "lightbulb" },
  ia: { label: "Uso responsable de la IA", i: "shield" },
  note: { label: "Nota sobre versiones", i: "info" },
  reto: { label: "Pon en práctica lo aprendido", i: "flag" }
};

function renderTable(b) {
  const isCheck = b.head[2] === "Listo";
  const spans = b.rows.map((r, i) => { if (!r[0]) return 0; let k = 1; while (b.rows[i + k] && !b.rows[i + k][0]) k++; return k; });
  const head = `<thead><tr>${b.head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>`;
  const body = b.rows.map((r, ri) => `<tr>${r.map((t, ci) => {
    if (ci === 0 && isCheck) return spans[ri] ? `<th scope="row" class="grp"${spans[ri] > 1 ? ` rowspan="${spans[ri]}"` : ""}>${esc(t)}</th>` : "";
    if (t === "☐") return `<td class="box"><span class="tbox" aria-label="Pendiente"></span></td>`;
    return ci === 0 ? `<th scope="row">${esc(t)}</th>` : `<td>${esc(t)}</td>`;
  }).join("")}</tr>`).join("");
  return `<div class="tbl-wrap"><table class="gtable${isCheck ? " checktable" : ""}">${head}<tbody>${body}</tbody></table></div>`;
}

// Devuelve el HTML del cuerpo de la guía
function renderGuide(c, opt = {}) {
  let html = `<section class="g-sec" id="${secId(c.n, "objetivo")}"><h2 class="g-h1">¿Qué lograrás?</h2>
    <div class="callout c-obj">${icon("target")}<div><p class="c-label">Objetivo de aprendizaje</p><p>${esc(c.objetivo)}</p></div></div></section>`;
  let pi = 0;
  for (const s of c.secciones) {
    html += `<section class="g-sec" id="${secId(c.n, s.h)}"><h2 class="g-h1">${esc(s.h)}</h2>`;
    let openStep = false;
    for (const b of s.blocks) {
      if (b.type === "step") {
        if (openStep) html += `</div></li>`;
        html += `${openStep ? "" : '<ol class="steps">'}<li class="step"><div class="step-n" aria-hidden="true">${String(b.n).padStart(2, "0")}</div><div class="step-body"><h3 class="step-t"><span class="sr-only">Paso ${b.n}: </span>${esc(b.title)}</h3>`;
        openStep = true; continue;
      }
      if (b.type === "p") html += `<p>${runs(b.runs)}</p>`;
      else if (b.type === "h3") html += `<h3 class="g-h3">${esc(b.text)}</h3>`;
      else if (b.type === "list") html += `<ul class="g-list">${b.items.map(i => `<li>${runs(i)}</li>`).join("")}</ul>`;
      else if (b.type === "callout") {
        const C = CALLOUT[b.kind];
        html += `<div class="callout c-${b.kind}">${icon(C.i)}<div><p class="c-label">${C.label}</p>${b.paras.map(p => `<p>${runs(p)}</p>`).join("")}</div></div>`;
      } else if (b.type === "prompt" || b.type === "code") {
        const id = `p${c.n}-${pi++}`;
        const title = b.type === "code" ? "Ejemplo en formato GIFT" : b.title;
        html += `<figure class="prompt"><figcaption>${icon(b.type === "code" ? "code" : "sparkles")}<span>${esc(title)}</span>${opt.print ? "" : `<button class="copy" type="button" data-copy="${id}">${icon("copy")}<span>Copiar</span></button>`}</figcaption>
          <pre id="${id}">${b.lines.map(esc).join("\n")}</pre></figure>`;
      } else if (b.type === "table") html += renderTable(b);
      else if (b.type === "check") html += `<ul class="checklist">${b.items.map((t, i) => `<li><label><input type="checkbox" data-ck="${c.n}-${i}"${opt.print ? " disabled" : ""}><span>${esc(t)}</span></label></li>`).join("")}</ul>`;
    }
    if (openStep) html += `</div></li></ol>`;
    html += `</section>`;
  }
  return html;
}

function guideMeta(c) {
  return `<ul class="g-meta">
    <li>${icon("layers")}<span><b>Ruta</b>${esc(c.ruta)}</span></li>
    <li>${icon("gauge")}<span><b>Nivel</b>${esc(c.nivel)}</span></li>
    <li>${icon("clock")}<span><b>Tiempo estimado</b>${esc(c.duracion)} · lectura + práctica</span></li>
    <li>${icon("monitor")}<span><b>Plataforma</b>${esc(c.plataforma)}</span></li></ul>`;
}
