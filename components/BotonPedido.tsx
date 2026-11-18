"use client";

import { Basket } from "@phosphor-icons/react";
import { cantidadTotal, pedido, usePedido } from "@/lib/pedido-store";
import { cn } from "@/lib/utils";

/**
 * Botón del pedido en la barra (derecha). Siempre visible: vacío muestra "Tu pedido";
 * con productos suma el número y da un saltito cada vez que cambia. En móvil, ícono + número.
 */
export function BotonPedido() {
  const { items } = usePedido();
  const cantidad = cantidadTotal(items);

  return (
    <button
      type="button"
      onClick={() => pedido.abrir()}
      data-cursor="boton"
      className={cn("btn h-11 gap-2 px-3.5 py-0 text-[15px] lg:px-5", cantidad > 0 ? "btn-primario" : "btn-secundario")}
    >
      {/* key: el saltito se reinicia con cada cambio de cantidad */}
      <span
        key={cantidad}
        aria-hidden
        className={cn("inline-flex items-center gap-2", cantidad > 0 && "animate-[rebote_0.45s_var(--ease-salida)]")}
      >
        <Basket size={20} weight="bold" aria-hidden />
        <span className="hidden lg:inline">Tu pedido</span>
        {cantidad > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-carbon px-1.5 text-[13px] text-hueso tabular-nums">
            {cantidad}
          </span>
        )}
      </span>
      <span className="sr-only">
        {cantidad > 0
          ? `Tu pedido: ${cantidad} ${cantidad === 1 ? "producto" : "productos"}. Ver y enviar el pedido`
          : "Tu pedido: todavía vacío"}
      </span>
    </button>
  );
}
