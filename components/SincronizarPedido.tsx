"use client";

import { useEffect } from "react";
import { pedido } from "@/lib/pedido-store";

/** Al cargar la página, cruza el pedido guardado en el navegador con lo disponible hoy en la planilla. */
export function SincronizarPedido({ catalogo }: { catalogo: { id: string; precio: number | null }[] }) {
  const clave = JSON.stringify(catalogo);
  useEffect(() => {
    pedido.sincronizar(JSON.parse(clave));
  }, [clave]);
  return null;
}
