# Costra Pizza: sitio web

Pizza tipo New York por porciones, Cipolletti. Una sola página con scroll animado.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · GSAP 3 + ScrollTrigger · Lenis · componentes de React Bits (copiados en el repo).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # compilación de producción
npm run lint
```

---

## Editar el contenido

Todo el texto editable está en `content/`. No hace falta tocar componentes.

| Archivo | Qué tiene |
|---|---|
| `content/site.ts` | Nombre, dirección, WhatsApp, Instagram, link de Google Maps, mensajes prellenados de WhatsApp, URL del sitio |
| `content/horarios.ts` | Horarios por día (para el "Abierto ahora" y para Google) y cómo se muestran agrupados |
| `content/menu.ts` | Porciones: nombre, descripción, precio, foto, si es vegetariana |
| `content/promos.ts` | Combos y promos |
| `content/textos.ts` | Frases de la cinta mostaza, texto de "Nosotros" y la porción del hero |

### Datos de ejemplo
Lo que está marcado con `// TODO` en `content/` todavía es provisorio (nombres de porciones, descripciones, combos, historia y horarios). Buscá "TODO" y reemplazalo con los datos reales antes de publicar.

### Precios
`precio: null` se muestra como `$ 0.000`. Poné el número sin puntos (`precio: 4500`) y se formatea solo (`$ 4.500`).

### Horarios
`horarios` usa 0 = domingo … 6 = sábado. El estado "Abierto ahora / Cerrado" se calcula en el navegador con la hora de Argentina (`America/Argentina/Buenos_Aires`), sin importar dónde esté quien mira. Con el local cerrado, los botones de WhatsApp siguen andando y avisan "Cerrado ahora · abrimos …". **Antes de publicar, confirmá con el local si toman encargos fuera de horario** y poné `aceptaEncargos` en `content/site.ts`: con `false` (por defecto) la web no promete nada y dice "Escribinos y te respondemos al abrir"; con `true` los botones dicen "Encargar por WhatsApp" y el mensaje lo pide como encargo. Con el local abierto, el estado dice cuánto falta para cerrar ("Cierra en 2 h 15 min"). Si cambiás horarios, actualizá también `horariosAgrupados` (lo que se lee en pantalla).

### Pedido por WhatsApp
Cada porción de la ruleta y cada combo tienen "Sumar al pedido". El pedido aparece arriba a la derecha ("Tu pedido") y, en el celular, en el botón fijo de abajo. Al abrirlo se ve la lista con cantidades editables, se pide el nombre (obligatorio) y aclaraciones (opcional), y "Enviar pedido por WhatsApp" abre WhatsApp con el mensaje armado, por ejemplo:

```
¡Hola Costra! Quiero hacer este pedido:

• 2 × Pomo (porciones)
• 1 × Costra (porción)
• 1 × Combo de ejemplo

Total: $ 12.500        ← solo si todos los precios están cargados
A nombre de: Ignacio
Aclaraciones: una sin albahaca
```

El pedido y el nombre se guardan en el navegador del visitante (si recarga no se pierden). El armado del mensaje está en `lib/pedido-store.ts` (`mensajePedido`).

---

## Cambiar las fotos

Todas las fotos son reales y se cargan desde `public/`. Next optimiza el tamaño y el formato solo. Para cambiar una, reemplazá el archivo (o cambiá la ruta en `content/`) y actualizá sus medidas.

**Fotos del local y la gente** (`public/equipo/`): la marquesina entre Combos y Nosotros (dos filas en sentidos opuestos) y la foto de Nosotros. Se configuran en `content/equipo.ts` (ruta, medidas y texto alternativo de cada una; también el sticker de la foto de Nosotros).

**Porciones recortadas** (`public/pizzas/`): PNG con fondo transparente (cheese, costra, especial, peperoni, pomo). El hero usa una por delante de "COSTRA"; se elige en `heroPorcion` (`content/textos.ts`). Para cambiarla, poné otro PNG recortado y actualizá la ruta y sus medidas.

Estilo de foto según la marca: porción sola sobre plato, fondo oscuro, luz cálida, gente real.

**Mapa** (sección "Cuándo y dónde"): Google Maps embebido sin API key, con carga diferida. La búsqueda está en `site.mapsEmbed` (`content/site.ts`). Un filtro CSS lo lleva a la paleta oscura de la marca; con el mouse encima se ve en colores reales.

Si agregás porciones, sumá el objeto en `content/menu.ts` con su PNG recortado de `public/pizzas/`: la ruleta reparte las porciones en círculo sola y cada una trae su "Pedí esta" con mensaje prellenado.

---

## Marca

El paquete de marca está en `brand/` (copia de `costra-pizza-paquete-de-marca/`). Los tokens están en `app/globals.css` dentro de `@theme`. La paleta por defecto de Tailwind está **anulada**: solo existen los colores de marca (`carbon`, `hollin`, `brasa`, `brasa-oscura`, `mostaza`, `albahaca`, `masa`, `hueso`, `apagado-oscuro`, `apagado-claro`). Radios: `rounded-chico` (6px), `rounded-medio` (14px), `rounded-full` (píldora).

- Fuentes: `app/fonts/` (Anton y DM Sans en WOFF2 con subset latino, generadas desde los TTF de `brand/fuentes/`). Se cargan con `next/font/local`.
- Logo: `public/brand/costra-gato-*.svg` (los SVG originales, sin modificar), usados desde `components/Gato.tsx`.
- Favicons y Open Graph: `app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`, `app/opengraph-image.png`, `app/manifest.ts`.

---

## Estructura

```
app/            layout (fuentes, metadata, JSON-LD Restaurant), page, estilos y tokens
components/
  sections/     una sección por archivo (server components)
  motion/       islas cliente con GSAP: HeroEscena, Revelar, FotoPegada
  reactbits/    ScrollReveal de React Bits, adaptado a la marca
  providers/    SmoothScroll: Lenis + ticker de GSAP (un solo loop)
  Nav, Cursor, WhatsAppFijo, EstadoAbierto, ...
content/        todo el contenido editable
lib/            utilidades (formato de precio, cálculo de horario)
public/pizzas/  porciones recortadas (PNG transparente)
public/equipo/  fotos del local y la gente
```

### Movimiento y accesibilidad
- Lenis solo suaviza la rueda del mouse; en celulares el scroll es nativo.
- El menú es una ruleta: las porciones forman una pizza que gira con el scroll (sección `sticky`, sin pin de GSAP). En escritorio la rueda asoma por la izquierda con la info a la derecha; en móvil asoma desde arriba con la info abajo.
- La cinta mostaza se pausa con su botón, al pasar el mouse y fuera de pantalla.
- Con `prefers-reduced-motion` no se crea Lenis, no hay animaciones de scroll ni cursor propio, y todo el contenido queda visible.
- El cursor propio aparece solo con mouse (`pointer: fine`).

---

## Publicar en Vercel

1. Subí el proyecto a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new), importá el repo. Vercel detecta Next.js solo; no hace falta configurar nada.
3. En **Settings → Environment Variables** agregá `NEXT_PUBLIC_SITE_URL` con el dominio final (ej. `https://costrapizza.com.ar`). Se usa para el canonical, Open Graph y el JSON-LD.
4. Para un dominio propio: **Settings → Domains**.

Antes de publicar: confirmar horarios y precios, reemplazar los textos marcados con `TODO` y confirmar si el local toma encargos fuera de horario (`aceptaEncargos`).
