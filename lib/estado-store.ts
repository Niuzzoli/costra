"use client";

import { useMemo, useSyncExternalStore } from "react";
import { estadoActual, type Estado } from "@/lib/horario";
import { useHorario } from "@/components/providers/HorarioProvider";

/**
 * Estado "abierto / cerrado" compartido por toda la página: un solo intervalo de un minuto,
 * sin importar cuántos componentes lo lean. El store solo emite la hora; el estado se calcula con
 * los horarios de la planilla (contexto). En el servidor (y antes de hidratar) es null.
 */
let ahora = 0;
const suscriptores = new Set<() => void>();
let timer: number | undefined;

function tick() {
  // Redondeado al minuto: el snapshot no cambia entre lecturas del mismo minuto.
  ahora = Math.floor(Date.now() / 60_000) * 60_000;
  suscriptores.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  suscriptores.add(avisar);
  if (suscriptores.size === 1) {
    tick();
    timer = window.setInterval(tick, 60_000);
  }
  return () => {
    suscriptores.delete(avisar);
    if (suscriptores.size === 0) window.clearInterval(timer);
  };
}

/** Milisegundos del minuto actual (null en el servidor y antes de hidratar). */
export function useAhora(): number | null {
  return useSyncExternalStore(
    suscribir,
    () => ahora || Math.floor(Date.now() / 60_000) * 60_000,
    () => null,
  );
}

export function useEstado(): Estado | null {
  const horario = useHorario();
  const t = useAhora();
  return useMemo(() => (t === null ? null : estadoActual(horario, new Date(t))), [horario, t]);
}
