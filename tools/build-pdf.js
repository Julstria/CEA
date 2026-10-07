// Genera los PDF (carpeta pdf/) con el mismo diseño de la página, usando Chrome o Edge
// Uso: npm run pdf   (desde la carpeta tools/)
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");
const { CAPS } = require("./data");

const ROOT = path.join(__dirname, "..");
const BROWSERS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome"
].filter(Boolean);
const executablePath = BROWSERS.find(p => fs.existsSync(p));

const small = "font-family:Segoe UI,Arial,sans-serif;font-size:8px;color:#52656a;width:100%;padding:0 17mm;display:flex;justify-content:space-between";
const header = right => `<div style="${small}"><span><b style="color:#087f91">CEA</b> · Centro de Innovación Pedagógica y Educación Digital</span><span>${right}</span></div>`;
const footer = left => `<div style="${small}"><span>${left} · Universidad de San Buenaventura Cali</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;

async function print(page, query, out, head, foot) {
  await page.goto(pathToFileURL(path.join(__dirname, "print.html")).href + query, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: out, format: "Letter", printBackground: true, displayHeaderFooter: true, headerTemplate: header(head), footerTemplate: footer(foot), preferCSSPageSize: true });
  console.log("ok", path.relative(ROOT, out));
}

(async () => {
  if (!executablePath) throw new Error("No se encontró Chrome ni Edge. Define CHROME_PATH.");
  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();
  for (const c of CAPS) await print(page, `?n=${c.n}`, path.join(ROOT, "pdf", c.file + ".pdf"), `Cápsula ${c.n}`, c.title);
  await print(page, "?all", path.join(ROOT, "pdf", "Capsulas_CEA_Guia_Completa.pdf"), "Guía completa", "Cápsulas Docentes CEA");
  await browser.close();
})();
