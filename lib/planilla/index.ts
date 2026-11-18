// Lee el menú, los combos y los horarios de la planilla de Google del local.
// La planilla está compartida como "Cualquier persona con el enlace: Lector" y cada pestaña se baja como CSV
// (sin claves). El resultado queda en la caché de Next 5 minutos: un cambio en la planilla aparece en la web
// en 5 minutos como máximo.
//
// Respaldo por pestaña: si una lectura falla (Google caído, pestaña renombrada, todo mal cargado) se usa la
// última lectura buena de este servidor y, si no hay, los datos de content/. La web nunca queda vacía ni rota.
import { cacheLife } from "next/cache";
import { porciones as porcionesRespaldo } from "@/content/menu";
import { promos as promosRespaldo } from "@/content/promos";
import { horarioRespaldo } from "@/content/horarios";
import { filasConEncabezado } from "./csv";
import { parseFechasEspeciales, parseHorarioSemanal, parsePorciones, parsePromos } from "./parsear";
import type { DatosLocal, FechaEspecial, HorarioSemanal, Porcion, Promo } from "./tipos";

export const PLANILLA_ID = process.env.PLANILLA_ID ?? "1pLJ6Yec1C4oRfrJErk-GVGW6a8KN4WgGFCtvVkom6oQ";

export const urlPestana = (pestana: string) =>
  `https://docs.google.com/spreadsheets/d/${PLANILLA_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(pestana)}`;

type Filas = Record<string, string>[];

async function leerPestana(pestana: string): Promise<Filas> {
  const res = await fetch(urlPestana(pestana), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const texto = await res.text();
  // Sin acceso, Google responde una página HTML de login en vez del CSV.
  if (/^\s*</.test(texto)) throw new Error("la planilla no está compartida con link (respondió HTML)");
  return filasConEncabezado(texto);
}

// Última lectura buena por pestaña (vive mientras viva la instancia del servidor).
const ultimaBuena: {
  porciones?: Porcion[];
  promos?: Promo[];
  semanal?: HorarioSemanal;
  especiales?: FechaEspecial[];
} = {};

/**
 * Lee y valida una pestaña. `parse` devuelve null cuando la pestaña no sirve (se usa el respaldo).
 * Devuelve [dato, vinoDelRespaldo].
 */
async function pestana<T>(nombre: string, parse: (f: Filas) => T | null, clave: keyof typeof ultimaBuena, respaldo: T): Promise<[T, boolean]> {
  try {
    const filas = await leerPestana(nombre);
    const dato = parse(filas);
    if (dato === null) throw new Error("sin filas válidas");
    (ultimaBuena as Record<string, unknown>)[clave] = dato;
    return [dato, false];
  } catch (e) {
    console.warn(`[planilla] "${nombre}": ${(e as Error).message}. Uso el respaldo.`);
    return [((ultimaBuena as Record<string, unknown>)[clave] as T | undefined) ?? respaldo, true];
  }
}

/** Una pestaña de catálogo sin ninguna fila (ni siquiera apagadas) no sirve; con filas apagadas, [] es un dato válido. */
const catalogo =
  <T>(parse: (f: Filas) => T[]) =>
  (f: Filas) =>
    f.length ? parse(f) : null;

export async function obtenerDatos(): Promise<DatosLocal> {
  "use cache";

  const [[porciones, r1], [promos, r2], [semanal, r3], [especiales, r4]] = await Promise.all([
    pestana("Porciones", catalogo(parsePorciones), "porciones", porcionesRespaldo),
    pestana("Combos", catalogo(parsePromos), "promos", promosRespaldo),
    pestana("Horarios", parseHorarioSemanal, "semanal", horarioRespaldo.semanal),
    // Fechas especiales vacía es lo normal: no es un error.
    pestana("Fechas especiales", parseFechasEspeciales, "especiales", horarioRespaldo.especiales),
  ]);

  // Si algo cayó al respaldo, el servidor reintenta al minuto en vez de a los 5.
  // (stale queda en 5 min: con menos, Next saca la página del prerender y pide <Suspense>.)
  if (r1 || r2 || r3 || r4) cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  else cacheLife({ stale: 300, revalidate: 300, expire: 86400 });

  return { porciones, promos, horario: { semanal, especiales } };
}
