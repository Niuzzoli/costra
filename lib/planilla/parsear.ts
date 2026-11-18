// Validación fila por fila de lo que viene de la planilla. Una fila mal cargada se descarta
// (o se corrige con un valor seguro) y el resto sigue: nunca rompe la web.
// Módulo puro: solo `import type` (lo cargan los tests con node --test).
import type { FechaEspecial, HorarioSemanal, Porcion, Promo, Turno } from "./tipos";

type Fila = Record<string, string | undefined>;

export const FOTO_GENERICA = "/pizzas/cheese.png";

const sinAcentos = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** "7000", "7.000", "$ 7.000" → 7000. Vacío o con letras → null. */
export function parsePrecio(s = ""): number | null {
  const limpio = s.replace(/[$\s.]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  return Math.round(Number(limpio));
}

/** Casilla de Sheets (TRUE/FALSE) o texto ("sí", "x"). */
export function parseCheck(s = ""): boolean {
  return ["true", "si", "x", "1", "verdadero"].includes(sinAcentos(s));
}

/**
 * "9:05" → "09:05". También acepta lo que exporta Sheets si la celda quedó como hora
 * ("20:00:00", "8:30 p. m."). Fuera de rango o mal escrita → null.
 */
export function parseHora(s = ""): string | null {
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a|p)?\.?\s*(?:m\.?)?$/i.exec(s.trim());
  if (!m) return null;
  let h = Number(m[1]);
  if (m[3]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (m[3].toLowerCase() === "p" ? 12 : 0);
  }
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

/** "1/2/2027" (DD/MM/AAAA) → "2027-02-01". Fecha inexistente → null. */
export function parseFecha(s = ""): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(Date.UTC(a, mes - 1, d));
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) return null;
  return `${a}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Link de Drive (/file/d/<id>/…, open?id=<id>, uc?id=<id>) → URL directa de la imagen.
 * Ruta de una foto del proyecto (/pizzas/x.png, pizzas/x.png, public/pizzas/x.png) → "/pizzas/x.png".
 * Cualquier otra cosa → null.
 */
export function normalizarFoto(s = ""): string | null {
  const t = s.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) {
    const id = /\/file\/d\/([\w-]+)/.exec(t)?.[1] ?? /[?&]id=([\w-]+)/.exec(t)?.[1];
    if (/drive\.google\.com|docs\.google\.com/i.test(t) && id) return `https://lh3.googleusercontent.com/d/${id}`;
    return null;
  }
  const ruta = t.replace(/\\/g, "/").replace(/^\/?(public\/)?/, "/");
  return /^\/[\w\-./]+\.(png|webp|jpe?g|avif)$/i.test(ruta) && !ruta.includes("..") ? ruta : null;
}

const texto = (f: Fila, k: string) => (f[k] ?? "").trim();

/** Stock destildado = agotado por hoy (se ve pero no se puede pedir). Sin columna o vacío = hay stock. */
const sinStock = (f: Fila) => texto(f, "stock") !== "" && !parseCheck(f.stock);

export function parsePorciones(filas: Fila[]): Porcion[] {
  return filas
    .filter((f) => parseCheck(f.disponible) && texto(f, "nombre"))
    .map((f) => ({
      nombre: texto(f, "nombre"),
      descripcion: texto(f, "descripcion"),
      precio: parsePrecio(f.precio),
      foto: normalizarFoto(f.foto) ?? FOTO_GENERICA,
      vegetariana: parseCheck(f.veggie),
      sinStock: sinStock(f),
    }));
}

export function parsePromos(filas: Fila[]): Promo[] {
  return filas
    .filter((f) => parseCheck(f.disponible) && texto(f, "nombre"))
    .map((f) => ({
      titulo: texto(f, "nombre"),
      detalle: texto(f, "detalle"),
      precio: parsePrecio(f.precio),
      destacada: parseCheck(f.destacado),
      sinStock: sinStock(f),
    }));
}

/** Turnos "abre N / cierra N" de una fila. Un turno con una sola hora válida se descarta. */
function turnos(f: Fila): Turno[] {
  const r: Turno[] = [];
  for (const n of [1, 2]) {
    const abre = parseHora(f[`abre ${n}`]);
    const cierra = parseHora(f[`cierra ${n}`]);
    if (abre && cierra && abre !== cierra) r.push({ abre, cierra });
  }
  return r;
}

const DIAS: Record<string, number> = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

/** Sin ninguna fila con un día válido → null (la pestaña no sirve: se usa el respaldo). */
export function parseHorarioSemanal(filas: Fila[]): HorarioSemanal | null {
  const r: HorarioSemanal = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  let validas = 0;
  for (const f of filas) {
    const dia = DIAS[sinAcentos(f.dia ?? "")];
    if (dia === undefined) continue;
    validas++;
    r[dia] = turnos(f);
  }
  return validas > 0 ? r : null;
}

export function parseFechasEspeciales(filas: Fila[]): FechaEspecial[] {
  const r: FechaEspecial[] = [];
  for (const f of filas) {
    const desde = parseFecha(f.desde);
    if (!desde) continue;
    const hasta = texto(f, "hasta") ? parseFecha(f.hasta) : desde;
    if (!hasta || hasta < desde) continue;
    r.push({ desde, hasta, turnos: turnos(f), aviso: texto(f, "aviso") });
  }
  return r;
}
