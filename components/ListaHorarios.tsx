"use client";

import { useMemo } from "react";
import { agruparHorarios, ahoraEnArgentina, avisoVigente, turnosDe } from "@/lib/horario";
import { useHorario } from "@/components/providers/HorarioProvider";
import { useAhora } from "@/lib/estado-store";
import { useDiaHoy } from "@/components/EstadoAbierto";
import { cn } from "@/lib/utils";

export function ListaHorarios() {
  const hoy = useDiaHoy();
  const horario = useHorario();
  const ahora = useAhora();
  const grupos = useMemo(() => agruparHorarios(horario.semanal), [horario]);
  // Vacaciones o feriado vigente o en los próximos 7 días (se calcula en el navegador: depende de la fecha)
  const aviso = ahora === null ? null : avisoVigente(horario, new Date(ahora));
  // Si hoy es una fecha especial (vacaciones, feriado), el horario semanal no rige hoy: sin marca "Hoy".
  const hoyEspecial = ahora !== null && (() => {
    const { fechaISO, dia } = ahoraEnArgentina(new Date(ahora));
    return Boolean(turnosDe(horario, fechaISO, dia).especial);
  })();
  return (
    <>
      {aviso && (
        <p role="note" className="mt-10 rounded-medio border-2 border-mostaza p-5 text-[18px] font-bold text-hueso md:p-6">
          {aviso}
        </p>
      )}
      <dl className={cn("grid gap-4", aviso ? "mt-4" : "mt-10")}>
      {grupos.map((g) => {
        const esHoy = hoy !== null && !hoyEspecial && g.diasNum.includes(hoy);
        return (
          <div
            key={g.dias}
            className={cn(
              "grid gap-3 rounded-medio border p-5 sm:grid-cols-[1fr_auto] sm:items-center md:p-6",
              esHoy ? "border-mostaza bg-hollin" : "border-masa/12",
            )}
          >
            <dt className="flex items-center gap-3">
              <span className="font-display text-[30px] leading-none whitespace-nowrap text-hueso uppercase md:text-[32px]">
                {g.dias}
              </span>
              {esHoy && <span className="etiqueta rounded-full bg-mostaza px-3 py-1 text-carbon">Hoy</span>}
            </dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-1 text-[18px] font-bold text-masa tabular-nums sm:justify-end">
              {g.turnos.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </dd>
          </div>
        );
      })}
      </dl>
    </>
  );
}
