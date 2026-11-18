// RESPALDO del menú: la web usa la pestaña "Porciones" de la planilla de Google (lib/planilla).
// Esto solo se muestra si la planilla nunca se pudo leer. Conviene mantenerlo parecido a la planilla.
//
// - foto: PNG recortado con fondo transparente en /public/pizzas (la punta de la porción hacia abajo).
// - precio: número en pesos, o null si todavía no está definido.
// - El orden de este array es el orden de la ruleta.

import type { Porcion } from "@/lib/planilla/tipos";

export type { Porcion };


export const porciones: Porcion[] = [
  {
    nombre: "Cheese", // TODO: confirmar nombre
    descripcion: "Descripción corta: ingredientes principales.", // TODO: reemplazar
    precio: 7000,
    foto: "/pizzas/cheese.png",
    vegetariana: true, // TODO: confirmar
  },
  {
    nombre: "Pepperoni", // TODO: confirmar nombre
    descripcion: "Descripción corta: ingredientes principales.", // TODO: reemplazar
    precio: 8000,
    foto: "/pizzas/peperoni.png",
  },
  {
    nombre: "Pomo", // TODO: confirmar nombre
    descripcion: "Descripción corta: ingredientes principales.", // TODO: reemplazar
    precio: 7000,
    foto: "/pizzas/pomo.png",
    vegetariana: true, // TODO: confirmar
  },
  {
    nombre: "Costra", // TODO: confirmar nombre
    descripcion: "Descripción corta: ingredientes principales.", // TODO: reemplazar
    precio: 8000,
    foto: "/pizzas/costra.png",
  },
  {
    nombre: "Especial", // TODO: confirmar nombre
    descripcion: "Descripción corta: ingredientes principales.", // TODO: reemplazar
    precio: 8000,
    foto: "/pizzas/especial.png",
  },
];
