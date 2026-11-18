# Menú, combos y horarios desde Google Sheets — diseño

Fecha: 2026-11-18 · Proyecto: Costra Pizza (Next 16, `cacheComponents: true`)

## Para qué

Hoy porciones, combos y horarios están escritos en el código (`content/menu.ts`, `content/promos.ts`,
`content/horarios.ts`). Cada cambio del local (un precio, una porción que se deja de vender, vacaciones)
obliga al cliente a escribirle al desarrollador y a volver a publicar. El objetivo es que **el cliente lo
maneje solo desde una planilla de Google** y la web se actualice sola, sin publicar nada.

Planilla: `1pLJ6Yec1C4oRfrJErk-GVGW6a8KN4WgGFCtvVkom6oQ` ("Costra - Pizza"). Hoy está vacía.

## Objetivos

- El cliente puede, desde la planilla:
  - **Porciones:** dar de alta, de baja, cambiar nombre, descripción, precio, foto y marca veggie;
    prenderlas/apagarlas con un check ("Disponible") sin borrarlas; cambiar el orden (orden de las filas).
  - **Combos:** lo mismo (alta, baja, check, precio, detalle) y elegir cuál va destacado.
  - **Horarios:** horario semanal (hasta dos turnos por día) y **fechas especiales** (vacaciones, feriados,
    días con horario distinto) con un aviso que se muestra en la web.
- Los cambios aparecen en la web en **5 minutos como máximo**.
- La web **nunca se ve rota** por un error de carga en la planilla.

## No objetivos

- Panel de administración propio, login o base de datos.
- Editar textos de otras secciones (hero, Nosotros, footer) o datos del local (dirección, WhatsApp): siguen en el código.
- Recortar automáticamente las fotos.
- Actualización instantánea (se eligió el camino con caché de 5 minutos).

## Anti-objetivos (fallaría aunque "funcione")

- Que una fila mal cargada (precio con letras, hora mal escrita) rompa la página o la ruleta.
- Que si Google no responde la web quede sin menú.
- Que el cliente necesite entender algo técnico (JSON, claves, publicar) para el uso diario.
- Que el carrito mande por WhatsApp un precio viejo o una porción que ya no se vende.

## Enfoques considerados

1. **Planilla pública + lectura del servidor con caché de 5 min** — sin claves ni Google Cloud. Datos públicos
   (no importa: son los mismos que muestra la web). **Elegido por el usuario.**
2. API de Google Sheets con clave — mismo resultado con más configuración (proyecto en Google Cloud, clave en Vercel).
3. Script en la planilla que avisa a la web al editar — instantáneo, pero más piezas que se rompen.

**Detalle de implementación (decisión del desarrollador):** en vez de "Publicar en la web" se usa el link
compartido ("Cualquier persona con el enlace: Lector") y el endpoint de exportación
`https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<pestaña>`. Es el mismo enfoque
(público, sin claves), pero "Publicar en la web" suma su propia caché de Google de ~5 minutos (hasta ~10 en total);
con el link compartido la demora es solo la nuestra. Si ese endpoint fallara, el plan B es "Publicar en la web"
(`/pub?output=csv&gid=<gid>`), con el mismo parser.

## La planilla

Una pestaña por tema, con encabezados fijos en la fila 1. Las columnas se leen **por nombre del encabezado**
(no por posición), así que reordenarlas no rompe nada. Casillas de verificación nativas de Sheets para los checks.

**Porciones**

| Disponible | Nombre | Descripción | Precio | Veggie | Foto |
|---|---|---|---|---|---|
| ☑ | Cheese | … | 7000 | ☑ | /pizzas/cheese.png |
| ☐ | Especial | … | 8000 | ☐ | https://drive.google.com/file/d/…/view |

**Combos**

| Disponible | Nombre | Detalle | Precio | Destacado |
|---|---|---|---|---|

**Horarios** (siete filas fijas, una por día, de lunes a domingo; vacío = cerrado)

| Día | Abre 1 | Cierra 1 | Abre 2 | Cierra 2 |
|---|---|---|---|---|
| Lunes | | | | |
| Martes | 11:45 | 16:30 | 20:00 | 23:45 |

**Fechas especiales** (vacaciones, feriados, días con otro horario)

| Desde | Hasta | Abre 1 | Cierra 1 | Abre 2 | Cierra 2 | Aviso |
|---|---|---|---|---|---|---|
| 01/02/2027 | 14/02/2027 | | | | | Nos fuimos de vacaciones, volvemos el 15 de febrero |

Sin horas = cerrado esos días. Con horas = reemplazan el horario semanal esos días. Una fila de un solo día
lleva Desde = Hasta (o Hasta vacío).

**Cómo usar** — pestaña de instrucciones para el cliente, en lenguaje simple: qué hace cada check, formato
de horas (`20:00`), cómo preparar y subir una foto (abajo), que el orden de las filas es el orden de la web,
y que los cambios tardan hasta 5 minutos.

Se cargan como datos de ejemplo los que hoy tiene la web (las 5 porciones, los 3 combos, martes a domingo
11:45–16:30 y 20:00–23:45, lunes cerrado; Fechas especiales vacía).

## Fotos

- **Formato (lo prepara el cliente):** PNG sin fondo, una porción con la punta hacia abajo, recortada al
  borde, proporción aproximada de 3:4 (ancho:alto ≈ 0.77), como las de `/public/pizzas`. La pestaña
  "Cómo usar" lo explica con un ejemplo y sugiere remove.bg.
- **Columna Foto acepta:** un link de Drive (`/file/d/<id>/…`, `open?id=<id>`, `uc?id=<id>`) o la ruta de una
  foto que ya está en `public/` del proyecto (`/pizzas/cheese.png`; también se acepta sin barra inicial,
  `pizzas/cheese.png`, o con la carpeta, `public/pizzas/cheese.png`). Los links de Drive se convierten a
  `https://lh3.googleusercontent.com/d/<id>` y se cargan con `next/image` (agregar ese host en
  `images.remotePatterns`). Next optimiza y guarda la imagen: Drive no recibe un pedido por visita.
- El archivo de Drive tiene que estar compartido como "Cualquier persona con el enlace".
- **Respaldo:** sin foto, link inválido o imagen que no carga → se muestra una foto genérica
  (decisión del desarrollador: `/pizzas/cheese.png`, la más neutra). La ruleta nunca queda con un hueco.

## Cómo llega a la web

- Una función del servidor por pestaña lee el CSV, lo parsea, **valida fila por fila** y devuelve datos tipados
  con la misma forma que hoy (`Porcion`, `Promo`, horarios). Las filas inválidas se descartan (y se loguean en
  el servidor); las demás se muestran.
- Caché de Next (`"use cache"` + `cacheLife` de 5 minutos, según la guía de Next 16 en
  `node_modules/next/dist/docs/`). Las secciones que leen la planilla van dentro de `Suspense` si la guía lo pide.
- **Respaldo en capas:** si la lectura falla, Next sigue sirviendo la última versión buena en caché. Si nunca
  hubo una (primer deploy con Google caído) o la pestaña viene vacía/ilegible por completo, se usan los datos de
  `content/*.ts`, que quedan como respaldo (se actualizan con los de ejemplo).
- Valores aceptados: precio como número (`7000`, `7.000`, `$ 7.000`); checks como TRUE/FALSE de la casilla
  (también "sí"/"x"); horas `H:MM` o `HH:MM`; fechas `DD/MM/AAAA`.

## Comportamiento en la web

- **Porción o combo con "Disponible" apagado:** no se muestra (ni en la ruleta, ni en el índice, ni en la lista
  para lectores de pantalla). Al volver a prenderlo reaparece en su lugar.
- **Combos:** el primero con "Destacado" es el grande en brasa; si ninguno lo tiene, el primero de la lista.
- **Sin combos disponibles:** se oculta la sección y su link en la barra. **Sin porciones disponibles:** la
  sección del menú muestra un texto corto ("Hoy no hay porciones cargadas, consultanos por WhatsApp") en vez de la ruleta.
- **Horarios:**
  - La lista de la sección "Cuándo y dónde" se agrupa sola a partir del horario semanal (días seguidos con
    los mismos turnos se juntan: "Martes a domingo"), como hoy.
  - Las fechas especiales se tienen en cuenta en el cartel de abierto/cerrado (hero y sección) y en "Abrimos …".
    Si hay una fecha especial con aviso activa hoy o en los próximos 7 días, el aviso se muestra en la sección
    de horarios (y en la píldora del hero cuando hoy está cerrado por esa fecha).
  - Se admiten cierres después de medianoche (ej. 20:00 a 01:00) — decisión del desarrollador, para que el
    cliente no tenga que partir el turno.
  - Los datos para Google (JSON-LD `openingHoursSpecification`) salen del horario semanal de la planilla.
  - El cálculo sigue en el navegador con hora de Argentina; los horarios llegan del servidor como datos.
- **Carrito:** al cargar, los ítems guardados se cruzan con los datos actuales: se actualiza el precio y se
  quitan los que ya no están disponibles, con un aviso en el panel ("Quitamos X: hoy no está disponible").

## Restricciones

- Next 16 con `cacheComponents`: leer la guía de caché de `node_modules/next/dist/docs/` antes de escribir.
- Hoy `lib/horario.ts` importa los horarios directo del archivo y lo usan componentes de cliente
  (`estado-store`, `ListaHorarios`, `EstadoAbierto`): hay que pasar los horarios del servidor al cliente.
- La ruleta (`MenuRuleta`) calcula su alto y su paso con la cantidad de porciones: tiene que funcionar con
  cualquier cantidad (1 a ~10).
- IDs del carrito: hoy `porcion:<nombre>` y `combo:<título>`; se mantienen.
- Mantener las decisiones de diseño ya tomadas (ver memoria del proyecto).

## Lo que hace el usuario (una vez)

- Compartir la planilla como "Cualquier persona con el enlace: Lector".
- Darle al cliente acceso de edición a la planilla.

## Queda a criterio del desarrollador

- Estructura de archivos (`lib/planilla/…`), el parser de CSV (sin dependencias si alcanza) y los nombres.
- Cómo pasar los horarios al cliente (props o contexto).
- Formato de la pestaña "Cómo usar", validación de datos en la planilla (listas, casillas, formato de hora).
- Tests del parser y de la lógica de horarios (fechas especiales, medianoche, agrupado).
