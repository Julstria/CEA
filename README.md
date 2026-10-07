# Cápsulas Docentes CEA

Catálogo web de las 16 cápsulas de formación docente del **CEA – Centro de Innovación Pedagógica y Educación Digital** de la Universidad de San Buenaventura Cali.

Cada cápsula tiene:

- su guía completa para leer en la página (objetivo, paso a paso, tips, errores frecuentes, reto y lista para verificar el avance),
- un espacio para el video (YouTube o Vimeo),
- su guía descargable en PDF.

La página permite filtrar por ruta formativa, nivel, tema y estado (pendientes, vistas, con video), copiar los prompts de las cápsulas de IA con un clic y marcar las cápsulas vistas. El avance se guarda en el navegador de cada docente.

## Estructura del repositorio

```
capsulas-cea/
├── index.html            Página principal
├── assets/
│   ├── css/styles.css    Estilos según el sistema de diseño del sitio del CEA (DESIGN.md)
│   ├── img/              Logos (versiones noche provisionales hasta recibir el kit oficial)
│   └── js/
│       ├── data.js       Contenido de las cápsulas y enlaces de los videos  ← aquí se edita
│       ├── guide.js      Dibuja una guía (lo usan la página y los PDF)
│       └── app.js        Filtros, lector de guías, avance y descargas
├── pdf/                  Guías en PDF (16 + guía completa)
├── word/                 Guías en Word (.docx), solo para uso interno del CEA; la página no las enlaza
├── tools/                Scripts que generan los Word y los PDF desde data.js
├── .nojekyll             Necesario para GitHub Pages
└── README.md
```

## Cómo agregar los videos

1. Abre `assets/js/data.js`.
2. Al final del archivo está la lista `VIDEOS`. Pega el enlace de cada cápsula entre las comillas:

   ```js
   const VIDEOS = {
     "01": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
     "02": "https://youtu.be/XXXXXXXXXXX",
     "03": "https://vimeo.com/123456789",
     ...
   };
   ```

3. Guarda y sube el cambio. La tarjeta mostrará la etiqueta **Video** y el video se reproducirá dentro de la guía.

Se aceptan enlaces de YouTube (watch, youtu.be, shorts) y Vimeo. Cualquier otro enlace se muestra como botón **Ver el video de la cápsula**.

## Cómo actualizar una guía

El contenido de las guías vive en un solo lugar: `assets/js/data.js`. La página, los Word y los PDF se generan a partir de él, así que siempre coinciden.

1. Edita el bloque de la cápsula en `assets/js/data.js` (objetivo, pasos, tips, tablas, etc.).
2. Regenera los documentos (requiere [Node.js](https://nodejs.org) y Google Chrome o Microsoft Edge):

   ```bash
   cd tools
   npm install      # solo la primera vez
   npm run build    # crea word/*.docx y pdf/*.pdf (incluida la guía completa)
   ```

   También puedes generar solo una parte con `npm run word` o `npm run pdf`.
3. Sube los cambios al repositorio.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `capsulas-cea`).
2. Sube todo el contenido de esta carpeta (botón **Add file › Upload files** y arrastra los archivos y carpetas), o desde la terminal:

   ```bash
   git init
   git add .
   git commit -m "Cápsulas docentes CEA"
   git branch -M main
   git remote add origin https://github.com/USUARIO/capsulas-cea.git
   git push -u origin main
   ```

3. En el repositorio ve a **Settings › Pages**, en *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. En uno o dos minutos la página estará en `https://USUARIO.github.io/capsulas-cea/`.

## Ver la página en tu computador

Abre `index.html` con doble clic. Para que las descargas funcionen igual que en línea, puedes usar un servidor local:

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000`.

## Enlaces directos por ruta

- `index.html#fundamentos` – Fundamentos del aula virtual
- `index.html#actividades` – Actividades y evaluación
- `index.html#gestion` – Gestión y seguimiento
- `index.html#ia` – IA para la docencia
- `index.html#capsula-05` – abre directamente la guía de la cápsula 05 (sirve para cualquier número)

---

CEA · Centro de Innovación Pedagógica y Educación Digital — Universidad de San Buenaventura Cali
