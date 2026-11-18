// RESPALDO de horarios: la web usa las pestañas "Horarios" y "Fechas especiales" de la planilla de Google
// (lib/planilla). Esto solo se muestra si la planilla nunca se pudo leer.
// Días: 0 = domingo, 1 = lunes ... 6 = sábado. Día sin turnos = cerrado.
import type { Horario, Turno } from "@/lib/planilla/tipos";

const dosTurnos: Turno[] = [
  { abre: "11:45", cierra: "16:30" },
  { abre: "20:00", cierra: "23:45" },
];

export const horarioRespaldo: Horario = {
  semanal: { 0: dosTurnos, 1: [], 2: dosTurnos, 3: dosTurnos, 4: dosTurnos, 5: dosTurnos, 6: dosTurnos },
  especiales: [],
};
