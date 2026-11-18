# Paquete de marca — Costra Pizza

- `guia/index.html` — guía visual completa (abrir en el navegador).
- `DESIGN.md` — decisiones de diseño con rol por color, tipografía y componentes.
- `logo/svg/` — gato vectorizado en carbón, masa, hueso, brasa y mostaza.
- `logo/png/` — PNG transparentes de 1024px y versiones sobre círculo (hueso, carbón, mostaza), como el avatar de Instagram.
- `favicon/` — favicon.ico, favicon.svg, 16/32px, apple-touch-icon 180, iconos 192/512 y `og-image-1200x630.png` para compartir links.
- `tokens/` — `tokens.css`, `tokens.json` y snippet de Tailwind.
- `fuentes/` — Anton y DM Sans (licencia OFL incluida).

## Cómo usarlo en la web
```html
<link rel="icon" href="/favicon/favicon.ico" sizes="any">
<link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
<meta property="og:image" content="/favicon/og-image-1200x630.png">
<link rel="stylesheet" href="/tokens/tokens.css">
```
Ajustar las rutas de `fuentes/` en `tokens.css` según donde queden los archivos.

## Importante
El logo se vectorizó automáticamente desde un JPG de 150×150 px. Sirve para web y redes; los ojos quedaron simplificados. Para impresión, pedir el archivo vectorial original a quien diseñó la marca.
