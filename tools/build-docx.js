// Genera las guías Word (carpeta word/) a partir de assets/js/data.js
// Uso: npm run word   (desde la carpeta tools/)
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, Header, Footer, PageNumber, LevelFormat, HeadingLevel,
  TabStopType, VerticalAlign, TableLayoutType
} = require("docx");
const T = require("./theme");

const ROOT = path.join(__dirname, "..");
const outDir = path.join(ROOT, "word");
const guides = require("./data").CAPS;

const FONT = "Calibri";
const W = 10080; // ancho útil: carta con márgenes de 0,75"
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NOB = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };

const run = (t, o = {}) => new TextRun({ text: t, font: FONT, ...o });
const runsOf = (rs, o = {}) => rs.map(r => run(r.t, { bold: r.b || o.bold, color: o.color, size: o.size }));

function box(children, { fill, bar, width = W, margins = { top: 160, bottom: 160, left: 240, right: 240 } }) {
  return new Table({
    width: { size: width, type: WidthType.DXA }, columnWidths: [width], layout: TableLayoutType.FIXED,
    borders: NOB,
    rows: [new TableRow({ children: [new TableCell({
      width: { size: width, type: WidthType.DXA },
      shading: fill ? { type: ShadingType.CLEAR, color: "auto", fill } : undefined,
      borders: { top: NONE, bottom: NONE, right: NONE, left: bar ? { style: BorderStyle.SINGLE, size: 24, color: bar } : NONE },
      margins, children
    })] })]
  });
}
const gap = (after = 120) => new Paragraph({ spacing: { after, before: 0 }, children: [] });
const label = (t, color) => new Paragraph({ spacing: { after: 60 }, children: [run(t.toUpperCase(), { bold: true, size: 17, color, characterSpacing: 20 })] });

function cover(g, R) {
  const kids = [
    new Paragraph({ spacing: { after: 80 }, children: [run(`CÁPSULA ${g.n}  ·  ${g.ruta.toUpperCase()}`, { bold: true, size: 18, color: "FFFFFF", characterSpacing: 30 })] }),
    new Paragraph({ spacing: { after: g.sub ? 80 : 0 }, children: [run(g.title, { bold: true, size: 48, color: "FFFFFF" })] })
  ];
  if (g.sub) kids.push(new Paragraph({ children: [run(g.sub, { size: 24, color: "FFFFFF" })] }));
  const metaCells = [["Ruta", g.ruta], ["Nivel", g.nivel], ["Tiempo de lectura", g.duracion], ["Plataforma", g.plataforma]];
  const cw = W / 4;
  return [
    box(kids, { fill: R.c, margins: { top: 360, bottom: 360, left: 360, right: 360 } }),
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: metaCells.map(() => cw), layout: TableLayoutType.FIXED,
      borders: { ...NOB, insideVertical: { style: BorderStyle.SINGLE, size: 4, color: T.line } },
      rows: [new TableRow({ children: metaCells.map(([k, v]) => new TableCell({
        width: { size: cw, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: "auto", fill: R.l },
        margins: { top: 140, bottom: 140, left: 200, right: 160 },
        children: [
          new Paragraph({ spacing: { after: 20 }, children: [run(k.toUpperCase(), { size: 15, bold: true, color: T.muted, characterSpacing: 20 })] }),
          new Paragraph({ children: [run(v, { size: 20, bold: true, color: T.ink })] })
        ]
      })) })]
    }),
    gap(240)
  ];
}

function h1(text, R) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 }, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: R.c, space: 4 } },
    children: [run(text, { bold: true, size: 30, color: R.c })]
  });
}
function step(s, R) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 100 }, keepNext: true,
    shading: { type: ShadingType.CLEAR, color: "auto", fill: R.l },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: R.c, space: 8 } },
    indent: { left: 160 },
    children: [run(`PASO ${String(s.n).padStart(2, "0")}`, { bold: true, size: 18, color: R.c, characterSpacing: 20 }), run("   "), run(s.title, { bold: true, size: 24, color: T.ink })]
  });
}
const h3 = (t, R) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 }, keepNext: true, children: [run(t, { bold: true, size: 23, color: T.ink })] });
const para = rs => new Paragraph({ spacing: { after: 140, line: 300 }, children: runsOf(rs, { size: 22, color: T.ink }) });
const bullet = rs => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 80, line: 290 }, children: runsOf(rs, { size: 22, color: T.ink }) });

function callout(b, R) {
  const C = b.kind === "reto" ? { label: T.callouts.reto.label, c: R.c, l: R.l } : T.callouts[b.kind];
  return [box([label(C.label, C.c), ...b.paras.map((p, i) => new Paragraph({ spacing: { after: i < b.paras.length - 1 ? 80 : 0, line: 290 }, children: runsOf(p, { size: 22, color: T.ink }) }))], { fill: C.l, bar: C.c }), gap(160)];
}
function mono(title, lines, hint) {
  const kids = [label(title, T.muted)];
  if (hint) kids.push(new Paragraph({ spacing: { after: 100 }, children: [run(hint, { italics: true, size: 18, color: T.muted })] }));
  lines.forEach((l, i) => kids.push(new Paragraph({ spacing: { after: i < lines.length - 1 ? 60 : 0, line: 280 }, children: [new TextRun({ text: l, font: "Consolas", size: 19, color: T.ink })] })));
  return [box(kids, { fill: "F3F4F6", bar: "9CA3AF" }), gap(160)];
}
function table(b, R) {
  const n = b.head.length;
  const widths = n === 2 ? [Math.round(W * 0.36), W - Math.round(W * 0.36)] : n === 3 ? (b.head[2] === "Listo" ? [2200, W - 3400, 1200] : [Math.round(W * 0.34), Math.round(W * 0.36), W - Math.round(W * 0.34) - Math.round(W * 0.36)]) : Array(n).fill(Math.floor(W / n));
  const cell = (t, w, o = {}) => new TableCell({
    width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, rowSpan: o.rowSpan,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [run(t, { bold: o.bold, size: o.size || 20, color: o.color || T.ink, font: o.font })] })]
  });
  // agrupa celdas vacías de la primera columna (lista de chequeo)
  const spans = b.rows.map((r, i) => { if (!r[0]) return 0; let k = 1; while (b.rows[i + k] && !b.rows[i + k][0]) k++; return k; });
  const rows = [new TableRow({ tableHeader: true, children: b.head.map((h, i) => cell(h, widths[i], { bold: true, fill: R.c, color: "FFFFFF", center: h === "Listo" })) })];
  b.rows.forEach((r, ri) => {
    const fill = ri % 2 ? T.soft : "FFFFFF";
    const cells = [];
    r.forEach((t, ci) => {
      if (ci === 0 && b.head[2] === "Listo") { if (spans[ri]) cells.push(cell(t, widths[0], { bold: true, fill: R.l, rowSpan: spans[ri] > 1 ? spans[ri] : undefined })); return; }
      const box = t === "☐";
      cells.push(cell(t, widths[ci], { bold: ci === 0 && n > 1, fill, center: box, size: box ? 26 : 20, font: box ? "Segoe UI Symbol" : undefined }));
    });
    rows.push(new TableRow({ cantSplit: true, children: cells }));
  });
  const bd = { style: BorderStyle.SINGLE, size: 4, color: T.line };
  return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, borders: { top: bd, bottom: bd, left: bd, right: bd, insideHorizontal: bd, insideVertical: bd }, rows }), gap(160)];
}
const check = t => new Paragraph({ spacing: { after: 90 }, indent: { left: 440, hanging: 440 }, children: [new TextRun({ text: "☐", font: "Segoe UI Symbol", size: 26, color: T.muted }), run("\t" + t, { size: 22, color: T.ink })], tabStops: [{ type: TabStopType.LEFT, position: 440 }] });

function body(g) {
  const R = T.routes[g.ruta];
  const out = [...cover(g, R)];
  out.push(h1("¿Qué lograrás?", R));
  out.push(box([label("Objetivo de aprendizaje", R.c), new Paragraph({ spacing: { line: 300 }, children: [run(g.objetivo, { size: 23, color: T.ink })] })], { fill: R.l, bar: R.c }), gap(120));
  for (const s of g.secciones) {
    if (!s.blocks.length) continue;
    out.push(h1(s.h, R));
    for (const b of s.blocks) {
      if (b.type === "p") out.push(para(b.runs));
      else if (b.type === "h3") out.push(h3(b.text, R));
      else if (b.type === "list") b.items.forEach(i => out.push(bullet(i)));
      else if (b.type === "step") out.push(step(b, R));
      else if (b.type === "callout") out.push(...callout(b, R));
      else if (b.type === "prompt") out.push(...mono(b.title, b.lines));
      else if (b.type === "code") out.push(...mono("Ejemplo en formato GIFT", b.lines));
      else if (b.type === "table") out.push(...table(b, R));
      else if (b.type === "check") b.items.forEach(t => out.push(check(t)));
    }
  }
  out.push(gap(240));
  out.push(box([
    new Paragraph({ spacing: { after: 60 }, children: [run("¿Necesitas acompañamiento?", { bold: true, size: 24, color: "FFFFFF" })] }),
    new Paragraph({ spacing: { after: 60 }, children: [run("El equipo del CEA te ayuda a implementar esta cápsula en tu curso.", { size: 21, color: "FFFFFF" })] }),
    new Paragraph({ children: [run("CEA · Centro de Innovación Pedagógica y Educación Digital — Universidad de San Buenaventura Cali", { size: 18, color: "D1D5DB" })] })
  ], { fill: T.ink, margins: { top: 240, bottom: 240, left: 300, right: 300 } }));
  return out;
}

function doc(g) {
  const R = T.routes[g.ruta];
  return new Document({
    creator: "CEA – Universidad de San Buenaventura Cali",
    title: `Cápsula ${g.n} · ${g.title}`,
    description: g.objetivo,
    styles: {
      default: { document: { run: { font: FONT, size: 22, color: T.ink }, paragraph: { spacing: { line: 290 } } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 30, bold: true, color: R.c }, paragraph: { outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 24, bold: true, color: T.ink }, paragraph: { outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 23, bold: true, color: T.ink }, paragraph: { outlineLevel: 2 } }
      ]
    },
    numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 520, hanging: 280 } }, run: { color: R.c, bold: true } } }] }] },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080, header: 500, footer: 500 } } },
      headers: { default: new Header({ children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: W }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: T.line, space: 6 } },
        children: [run("CEA", { bold: true, size: 17, color: T.brand }), run("  ·  Centro de Innovación Pedagógica y Educación Digital", { size: 17, color: T.muted }), run(`\tCápsula ${g.n}`, { bold: true, size: 17, color: R.c })]
      })] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: W }],
        children: [run(`${g.title}  ·  Universidad de San Buenaventura Cali`, { size: 16, color: T.muted }), run("\tPágina ", { size: 16, color: T.muted }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: T.muted }), run(" de ", { size: 16, color: T.muted }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: T.muted })]
      })] }) },
      children: body(g)
    }]
  });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  for (const g of guides) {
    const buf = await Packer.toBuffer(doc(g));
    fs.writeFileSync(path.join(outDir, g.file + ".docx"), buf);
    console.log("ok", g.file, buf.length);
  }
})();
