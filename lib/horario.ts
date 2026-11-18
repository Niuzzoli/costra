// Lógica de horarios: abierto/cerrado, próxima apertura, fechas especiales y agrupado para mostrar.
// Módulo puro: recibe los horarios como dato (vienen de la planilla) y solo usa `import type`.
import type { FechaEspecial, Horario, HorarioSemanal, Turno } from "./planilla/tipos";

const ZONA = "America/Argentina/Buenos_Aires";
const nombresDia = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const diaIndice: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const cruzaMedianoche = (t: Turno) => aMinutos(t.cierra) <= aMinutos(t.abre);

/** 135 → "2 h 15 min"; 120 → "2 h"; 40 → "40 min". */
function duracion(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "2026-11-17" + 2 → "2026-11-19". */
function sumarDias(fechaISO: string, dias: number) {
  const [a, m, d] = fechaISO.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Día de la semana (0 = domingo), minutos desde medianoche y fecha "AAAA-MM-DD", en hora de Argentina. */
export function ahoraEnArgentina(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "0";
  return {
    dia: diaIndice[get("weekday")] ?? 0,
    minutos: Number(get("hour")) * 60 + Number(get("minute")),
    fechaISO: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

/** Turnos de una fecha: los de una fecha especial si hay una, si no los del horario semanal. Ordenados por apertura. */
export function turnosDe(horario: Horario, fechaISO: string, dia: number): { turnos: Turno[]; especial?: FechaEspecial } {
  const especial = horario.especiales.find((e) => e.desde <= fechaISO && fechaISO <= e.hasta);
  const turnos = [...(especial ? especial.turnos : (horario.semanal[dia] ?? []))].sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre));
  return especial ? { turnos, especial } : { turnos };
}

export type Estado = { abierto: boolean; detalle: string; aviso?: string };

export function estadoActual(horario: Horario, fecha = new Date()): Estado {
  const { dia, minutos, fechaISO } = ahoraEnArgentina(fecha);
  const hoy = turnosDe(horario, fechaISO, dia);
  const ayer = turnosDe(horario, sumarDias(fechaISO, -1), (dia + 6) % 7);
  const conAviso = (e: Estado): Estado => (hoy.especial?.aviso ? { ...e, aviso: hoy.especial.aviso } : e);

  // Abierto por un turno de anoche que cruza la medianoche
  const deAnoche = ayer.turnos.find((t) => cruzaMedianoche(t) && minutos < aMinutos(t.cierra));
  if (deAnoche) return conAviso({ abierto: true, detalle: `Cierra en ${duracion(aMinutos(deAnoche.cierra) - minutos)}` });

  for (const t of hoy.turnos) {
    const abre = aMinutos(t.abre);
    const cierra = aMinutos(t.cierra);
    if (cruzaMedianoche(t) ? minutos >= abre : minutos >= abre && minutos < cierra) {
      const faltan = cruzaMedianoche(t) ? 24 * 60 - minutos + cierra : cierra - minutos;
      return conAviso({ abierto: true, detalle: `Cierra en ${duracion(faltan)}` });
    }
  }

  const masTarde = hoy.turnos.find((t) => aMinutos(t.abre) > minutos);
  if (masTarde) return conAviso({ abierto: false, detalle: `Abrimos hoy a las ${masTarde.abre}` });

  for (let i = 1; i <= 14; i++) {
    const f = sumarDias(fechaISO, i);
    const d = (dia + i) % 7;
    const primero = turnosDe(horario, f, d).turnos[0];
    if (primero) {
      const cuando = i === 1 ? "mañana" : i < 7 ? `el ${nombresDia[d]}` : `el ${nombresDia[d]} ${Number(f.slice(8))}`;
      return conAviso({ abierto: false, detalle: `Abrimos ${cuando} a las ${primero.abre}` });
    }
  }
  return conAviso({ abierto: false, detalle: "Consultá por WhatsApp" });
}

/** Aviso de una fecha especial vigente hoy o que empieza en los próximos 7 días. */
export function avisoVigente(horario: Horario, fecha = new Date()): string | null {
  const { fechaISO } = ahoraEnArgentina(fecha);
  const limite = sumarDias(fechaISO, 7);
  const e = horario.especiales.find((x) => x.aviso && x.hasta >= fechaISO && x.desde <= limite);
  return e?.aviso ?? null;
}

const Mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

/**
 * Agrupa días seguidos con los mismos turnos: "Martes a domingo", "Sábado y domingo", "Lunes".
 * La semana arranca en el primer día que abre (así "Martes a domingo" va antes que "Lunes: cerrado").
 */
export function agruparHorarios(semanal: HorarioSemanal) {
  const clave = (d: number) => (semanal[d] ?? []).map((t) => `${t.abre}-${t.cierra}`).join("|");
  const inicio = Math.max(
    0,
    ORDEN_SEMANA.findIndex((d) => (semanal[d] ?? []).length > 0),
  );
  const semana = [...ORDEN_SEMANA.slice(inicio), ...ORDEN_SEMANA.slice(0, inicio)];

  const grupos: number[][] = [];
  for (const d of semana) {
    const ultimo = grupos.at(-1);
    if (ultimo && clave(ultimo[0]) === clave(d)) ultimo.push(d);
    else grupos.push([d]);
  }

  return grupos.map((dias) => {
    const [a, b] = [Mayus(nombresDia[dias[0]]), nombresDia[dias[dias.length - 1]]];
    const turnos = semanal[dias[0]] ?? [];
    return {
      dias: dias.length === 1 ? a : dias.length === 2 ? `${a} y ${b}` : `${a} a ${b}`,
      turnos: turnos.length ? turnos.map((t) => `${t.abre} a ${t.cierra}`) : ["Cerrado"],
      diasNum: dias,
    };
  });
}

/**
 * Los días que abre, sin importar el horario de cada uno: "Martes a domingo", "Lunes a viernes",
 * "Viernes y sábado", "Domingo, lunes y miércoles", "Todos los días". Nunca abre → null.
 * Para textos como el del hero o la cinta. Tramos de 3 días o más se dicen "X a Y".
 */
export function diasQueAbre(semanal: HorarioSemanal): string | null {
  const abre = (d: number) => (semanal[d] ?? []).length > 0;
  const abiertos = ORDEN_SEMANA.filter(abre);
  if (abiertos.length === 0) return null;
  if (abiertos.length === 7) return "Todos los días";

  // Arranca en un día que abre después de uno cerrado: así un tramo que cruza el domingo queda junto.
  const i = ORDEN_SEMANA.findIndex((d, k) => abre(d) && !abre(ORDEN_SEMANA[(k + 6) % 7]));
  const semana = [...ORDEN_SEMANA.slice(i), ...ORDEN_SEMANA.slice(0, i)];

  const tramos: number[][] = [];
  semana.forEach((d, k) => {
    if (!abre(d)) return;
    if (k > 0 && abre(semana[k - 1])) tramos.at(-1)!.push(d);
    else tramos.push([d]);
  });

  // Primero el tramo con el día más temprano de la semana (lunes primero): "Domingo, lunes y miércoles".
  const posicion = (t: number[]) => Math.min(...t.map((d) => ORDEN_SEMANA.indexOf(d)));
  tramos.sort((x, y) => posicion(x) - posicion(y));

  const partes = tramos.flatMap((t) => (t.length >= 3 ? [`${nombresDia[t[0]]} a ${nombresDia[t.at(-1)!]}`] : t.map((d) => nombresDia[d])));
  const texto = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}`;
  return Mayus(texto);
}
