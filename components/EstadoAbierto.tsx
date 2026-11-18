"use client";

import { useSyncExternalStore } from "react";
import { ahoraEnArgentina, diasQueAbre } from "@/lib/horario";
import { useHorario } from "@/components/providers/HorarioProvider";
import { useEstado } from "@/lib/estado-store";
import { cn } from "@/lib/utils";

/**
 * Estado "Abierto ahora / Cerrado" calculado en el navegador con la hora de Argentina y los horarios de la planilla
 * (no depende de la zona horaria del visitante).
 * - Por defecto: sticker grande (sección Horarios).
 * - compacto: píldora neutra para el hero (el acento del hero ya es brasa). Solo informa, no es clickeable.
 * Antes de hidratar muestra un estado neutro del mismo tamaño (sin salto de layout).
 */
export function EstadoAbierto({ compacto = false }: { compacto?: boolean }) {
  const estado = useEstado();
  const horario = useHorario();

  if (compacto) {
    return (
      // Solo informa: no es un link (para ir a los horarios ya está el botón "Horarios")
      <p aria-live="polite" className="inline-flex items-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-masa/15 px-3.5 py-1.5 text-[13px] text-masa">
          <span
            aria-hidden
            className={cn(
              "size-1.5 shrink-0 rounded-full ring-[3px]",
              estado?.abierto
                ? "bg-hueso ring-albahaca"
                : estado
                  ? "bg-brasa ring-brasa/25"
                  : "bg-apagado-oscuro ring-transparent",
            )}
          />
          {estado === null ? (
            // Antes de hidratar: los días que abre según la planilla ("Martes a domingo")
            (diasQueAbre(horario.semanal) ?? "Horarios")
          ) : (
            <span>
              <span className="font-bold">{estado.abierto ? "Abierto" : "Cerrado"}</span>
              <span className="text-apagado-oscuro">
                {" · "}
                {/* Cerrado por una fecha especial (vacaciones, feriado): el aviso explica por qué */}
                {!estado.abierto && estado.aviso ? estado.aviso : estado.detalle.toLowerCase()}
              </span>
            </span>
          )}
        </span>
      </p>
    );
  }

  return (
    <div aria-live="polite" className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <p
        className={cn(
          "sticker -rotate-2 text-[32px] md:text-[40px]",
          estado === null && "bg-hollin text-apagado-oscuro",
          estado?.abierto === true && "bg-albahaca text-hueso",
          estado?.abierto === false && "bg-brasa text-carbon",
        )}
      >
        {estado === null ? "Horarios" : estado.abierto ? "Abierto ahora" : "Cerrado"}
      </p>
      {/* El aviso de una fecha especial lo muestra ListaHorarios, justo debajo */}
      <p className="text-[18px] font-medium text-masa">{estado?.detalle ?? " "}</p>
    </div>
  );
}

const sinSuscripcion = () => () => {};

/** Marca la fila del día de hoy (en hora de Argentina). En el servidor devuelve null. */
export function useDiaHoy() {
  return useSyncExternalStore(
    sinSuscripcion,
    () => ahoraEnArgentina().dia,
    () => null,
  );
}
