// Tokens compartidos por el Word (los mismos de assets/css/styles.css)
// Manual de marca USB: negro #1D1D1B, naranja #EF7D00, blanco y gris. Acentos: azul y turquesa del logo del CEA.
// Por ruta: c = texto y bordes, f = relleno, on = texto sobre el relleno, l = fondo suave
module.exports = {
  brand: "EF7D00",
  brandText: "A65200",
  ink: "1D1D1B",
  muted: "5C5C5A",
  line: "E2E2DF",
  soft: "F4F4F2",
  routes: {
    "Fundamentos del aula virtual": { key: "fundamentos", c: "0A4A92", f: "0A4A92", on: "FFFFFF", l: "E8EEF7" },
    "Actividades y evaluación": { key: "actividades", c: "0B6F86", f: "0B6F86", on: "FFFFFF", l: "E4F3F6" },
    "Gestión y seguimiento": { key: "gestion", c: "1D1D1B", f: "1D1D1B", on: "FFFFFF", l: "EDEDEB" },
    "IA para la docencia": { key: "ia", c: "A65200", f: "EF7D00", on: "1D1D1B", l: "FDEBD3" }
  },
  callouts: {
    tip: { label: "Tip docente", c: "8A5A00", bar: "EF7D00", l: "FFF4DC" },
    ia: { label: "Uso responsable de la IA", c: "A65200", bar: "EF7D00", l: "FDEBD3" },
    note: { label: "Nota sobre versiones", c: "0A4A92", bar: "0A4A92", l: "E8EEF7" },
    reto: { label: "Pon en práctica lo aprendido", c: "1D1D1B", bar: "1D1D1B", l: "F4F4F2" }
  }
};
