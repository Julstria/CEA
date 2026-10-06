# Cápsulas Docentes CEA

Catálogo web de las 16 cápsulas de formación docente del **CEA – Centro de Innovación Pedagógica y Educación Digital** de la Universidad de San Buenaventura Cali.

Cada cápsula tiene:

- su ficha con objetivo y paso a paso,
- un espacio para el video (YouTube o Vimeo),
- su guía descargable en PDF (y la versión editable en Word).

La página permite filtrar por ruta formativa, nivel, palabra clave y estado (vistas, no vistas, con video).

## Estructura del repositorio

```
capsulas-cea/
├── index.html            Página principal
├── assets/
│   ├── css/styles.css    Estilos (colores y tipografía del CEA)
│   └── js/
│       ├── data.js       Datos de las cápsulas y enlaces de los videos  ← aquí se edita
│       └── app.js        Lógica de filtros, fichas y descargas
├── pdf/                  Guías en PDF (16 + guía completa)
├── word/                 Guías editables en Word (.docx)
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

3. Guarda y sube el cambio. La tarjeta pasará a mostrar **Video disponible** y el video se reproducirá dentro de la ficha.

Se aceptan enlaces de YouTube (watch, youtu.be, shorts) y Vimeo. Cualquier otro enlace se muestra como botón **Ver video**.

## Cómo actualizar una guía

1. Edita el Word en la carpeta `word/`.
2. Exporta a PDF con el **mismo nombre de archivo** y reemplázalo en `pdf/`.
3. Si cambias el contenido de una cápsula (objetivo o pasos), actualiza también su bloque en `assets/js/data.js`.

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

---

CEA · Centro de Innovación Pedagógica y Educación Digital — Universidad de San Buenaventura Cali
