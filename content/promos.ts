// RESPALDO de combos: la web usa la pestaña "Combos" de la planilla de Google (lib/planilla).
// Esto solo se muestra si la planilla nunca se pudo leer.


import type { Promo } from "@/lib/planilla/tipos";

export type { Promo };

export const promos: Promo[] = [
  {
    titulo: "Combo de ejemplo", // TODO: reemplazar
    detalle: "Porción + bebida. Detalle del combo.", // TODO: reemplazar
    precio: 15000,
    destacada: true,
  },
  {
    titulo: "Promo de ejemplo", // TODO: reemplazar
    detalle: "Condición de la promo (días, medio de pago).", // TODO: reemplazar
    precio: 13000,
  },
  {
    titulo: "Combo de ejemplo 2", // TODO: reemplazar
    detalle: "Dos porciones + bebida. Detalle del combo.", // TODO: reemplazar
    precio: 18000,
  },
];
