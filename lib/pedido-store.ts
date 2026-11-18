"use client";

import { useSyncExternalStore } from "react";
import { mensajes, site } from "@/content/site";
import { formatoPrecio } from "@/lib/utils";

/**
 * El pedido que el visitante va armando en la web.
 * Vive en un store chico (sin dependencias) y se guarda en localStorage del navegador del visitante,
 * así no se pierde si recarga. Si el navegador no deja guardar (modo privado, etc.), funciona igual en memoria.
 */

export type TipoItem = "porcion" | "combo";
export type ItemPedido = { id: string; tipo: TipoItem; nombre: string; precio: number | null; cantidad: number; foto?: string };
/**
 * Ítems que se sacaron solos al cruzar con la planilla (se muestra un aviso en el panel):
 * quitados = ya no están en la web; agotados = siguen, pero se quedaron sin stock.
 */
type Estado = { items: ItemPedido[]; abierto: boolean; anuncio: string; quitados: string[]; agotados: string[] };

// v2: con precios cargados (descarta pedidos de prueba guardados sin precio)
const CLAVE = "costra-pedido-v2";
const CLAVE_NOMBRE = "costra-nombre-v1";
const INICIAL: Estado = { items: [], abierto: false, anuncio: "", quitados: [], agotados: [] };

let estado: Estado | null = null;
const suscriptores = new Set<() => void>();

function leer(): Estado {
  if (estado === null) {
    let items: ItemPedido[] = [];
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
      if (Array.isArray(guardado)) items = guardado.filter((i) => i && typeof i.id === "string" && i.cantidad > 0);
    } catch {
      /* sin storage: arrancamos vacío */
    }
    estado = { ...INICIAL, items };
  }
  return estado;
}

function escribir(cambios: Partial<Estado>) {
  estado = { ...leer(), ...cambios };
  if ("items" in cambios) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado.items));
    } catch {
      /* sin storage: queda en memoria */
    }
  }
  suscriptores.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  suscriptores.add(avisar);
  return () => suscriptores.delete(avisar);
}

export function usePedido() {
  return useSyncExternalStore(suscribir, leer, () => INICIAL);
}

const etiqueta = (i: Pick<ItemPedido, "tipo" | "nombre">, cantidad: number) =>
  i.tipo === "porcion" ? `${i.nombre} (${cantidad === 1 ? "porción" : "porciones"})` : i.nombre;

export const pedido = {
  agregar(item: Omit<ItemPedido, "cantidad">) {
    const { items } = leer();
    const existe = items.find((i) => i.id === item.id);
    const nuevos = existe
      ? items.map((i) => (i.id === item.id ? { ...i, precio: item.precio, foto: item.foto ?? i.foto, cantidad: i.cantidad + 1 } : i))
      : [...items, { ...item, cantidad: 1 }];
    const cant = (existe?.cantidad ?? 0) + 1;
    escribir({ items: nuevos, anuncio: `Sumaste ${etiqueta(item, cant)}. En tu pedido: ${cant}.` });
  },
  cambiar(id: string, delta: number) {
    const { items } = leer();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const cant = item.cantidad + delta;
    const nuevos = cant <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, cantidad: cant } : i));
    escribir({
      items: nuevos,
      anuncio: cant <= 0 ? `Sacaste ${item.nombre} del pedido.` : `${etiqueta(item, cant)}: ${cant}.`,
    });
  },
  /**
   * Cruza el pedido guardado con lo que hoy está disponible en la planilla: actualiza precios y quita
   * lo que ya no se vende (así nunca se manda por WhatsApp un precio viejo o algo que no hay).
   */
  sincronizar(catalogo: { id: string; precio: number | null; sinStock?: boolean }[]) {
    const { items } = leer();
    const porId = new Map(catalogo.map((c) => [c.id, c]));
    const quitados = items.filter((i) => !porId.has(i.id)).map((i) => i.nombre);
    const agotados = items.filter((i) => porId.get(i.id)?.sinStock).map((i) => i.nombre);
    const quedan = items.filter((i) => porId.has(i.id) && !porId.get(i.id)!.sinStock);
    const nuevos = quedan.map((i) => ({ ...i, precio: porId.get(i.id)!.precio }));
    const cambioPrecio = nuevos.some((n, k) => n.precio !== quedan[k].precio);
    if (quitados.length === 0 && agotados.length === 0 && !cambioPrecio) return;
    escribir({ items: nuevos, quitados, agotados, anuncio: avisoQuitados(quitados, agotados) });
  },
  descartarAviso() {
    escribir({ quitados: [], agotados: [] });
  },
  vaciar() {
    escribir({ items: [], anuncio: "Vaciaste el pedido." });
  },
  abrir() {
    escribir({ abierto: true });
  },
  cerrar() {
    escribir({ abierto: false });
  },
};

/** ["A"] → "A"; ["A", "B"] → "A y B"; ["A", "B", "C"] → "A, B y C" ("e" antes de i/hi). */
const enLista = (n: string[]) =>
  n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} ${/^h?i/i.test(n.at(-1)!) ? "e" : "y"} ${n.at(-1)}`;

/** Aviso del panel: "Quitamos Pomo del pedido: hoy no está disponible." / "…: se quedó sin stock." */
export function avisoQuitados(quitados: string[], agotados: string[] = []) {
  const partes: string[] = [];
  if (quitados.length)
    partes.push(`Quitamos ${enLista(quitados)} del pedido: hoy no ${quitados.length === 1 ? "está disponible" : "están disponibles"}.`);
  if (agotados.length)
    partes.push(`Quitamos ${enLista(agotados)} del pedido: ${agotados.length === 1 ? "se quedó" : "se quedaron"} sin stock.`);
  return partes.join(" ");
}

export const cantidadTotal = (items: ItemPedido[]) => items.reduce((n, i) => n + i.cantidad, 0);

/** Total solo si todos los precios están cargados; si falta alguno, null ("a confirmar"). */
export const totalPedido = (items: ItemPedido[]) =>
  items.length > 0 && items.every((i) => i.precio !== null)
    ? items.reduce((n, i) => n + (i.precio ?? 0) * i.cantidad, 0)
    : null;

export function nombreGuardado() {
  try {
    return localStorage.getItem(CLAVE_NOMBRE) ?? "";
  } catch {
    return "";
  }
}

export function guardarNombre(nombre: string) {
  try {
    localStorage.setItem(CLAVE_NOMBRE, nombre);
  } catch {
    /* sin storage */
  }
}

/** Mensaje de WhatsApp listo para mandar al local. */
export function mensajePedido(items: ItemPedido[], nombre: string, aclaraciones: string, cerrado: boolean) {
  const lineas = items.map((i) => `• ${i.cantidad} × ${etiqueta(i, i.cantidad)}`);
  const total = totalPedido(items);
  const partes = [
    `¡Hola ${site.nombre.split(" ")[0]}! Quiero hacer este pedido:`,
    "",
    ...lineas,
    "",
    ...(total !== null ? [`Total: ${formatoPrecio(total)}`] : []),
    `A nombre de: ${nombre.trim()}`,
    ...(aclaraciones.trim() ? [`Aclaraciones: ${aclaraciones.trim()}`] : []),
  ];
  const texto = partes.join("\n");
  return cerrado ? mensajes.fueraDeHorario(texto) : texto;
}
