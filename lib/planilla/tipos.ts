// Tipos de los datos que salen de la planilla de Google (y de los respaldos en content/).

export type Porcion = {
  nombre: string;
  descripcion: string;
  precio: number | null;
  /** Ruta local (/pizzas/…) o URL de Drive ya convertida (lh3.googleusercontent.com/d/…). */
  foto: string;
  vegetariana?: boolean;
  /** Se muestra, pero no se puede sumar al pedido (columna Stock destildada). */
  sinStock?: boolean;
};

export type Promo = {
  titulo: string;
  detalle: string;
  precio: number | null;
  /** La destacada se muestra grande y en brasa. Solo una. */
  destacada?: boolean;
  /** Se muestra, pero no se puede sumar al pedido (columna Stock destildada). */
  sinStock?: boolean;
};

/** "HH:MM". Si cierra <= abre, el turno cruza la medianoche. */
export type Turno = { abre: string; cierra: string };

/** 0 = domingo … 6 = sábado. Día sin turnos = cerrado. */
export type HorarioSemanal = Record<number, Turno[]>;

/** Vacaciones, feriados o días con otro horario. Fechas "AAAA-MM-DD", ambas inclusive. Sin turnos = cerrado. */
export type FechaEspecial = { desde: string; hasta: string; turnos: Turno[]; aviso: string };

export type Horario = { semanal: HorarioSemanal; especiales: FechaEspecial[] };

export type DatosLocal = { porciones: Porcion[]; promos: Promo[]; horario: Horario };
