// Lee los datos de la página (assets/js/data.js) para usarlos en Node
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "data.js"), "utf8");
module.exports = new Function(src + "\nreturn { CAPS, VIDEOS };")();
