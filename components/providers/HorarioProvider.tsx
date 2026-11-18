"use client";

import { createContext, useContext, type ReactNode } from "react";
import { horarioRespaldo } from "@/content/horarios";
import type { Horario } from "@/lib/planilla/tipos";

/** Los horarios vienen de la planilla (servidor) y se calculan en el navegador con la hora de Argentina. */
const HorarioCtx = createContext<Horario>(horarioRespaldo);

export function HorarioProvider({ horario, children }: { horario: Horario; children: ReactNode }) {
  return <HorarioCtx.Provider value={horario}>{children}</HorarioCtx.Provider>;
}

export const useHorario = () => useContext(HorarioCtx);
