"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { pedido, usePedido, type TipoItem } from "@/lib/pedido-store";
import { cn } from "@/lib/utils";

type Tono = "claro" | "oscuro" | "brasa";

/**
 * Colores según el fondo donde va (masa, carbón/hollín o brasa).
 * - boton: "Sumar al pedido" (el hover lo da .btn: relleno mostaza de izquierda a derecha).
 * - pastilla / circulo: el contador una vez sumado.
 */
const estilos: Record<Tono, { boton: string; pastilla: string; circulo: string; etiqueta: string }> = {
  claro: {
    boton: "bg-carbon text-hueso",
    pastilla: "bg-carbon text-hueso",
    circulo: "bg-hollin text-hueso hover:bg-brasa hover:text-carbon",
    etiqueta: "text-apagado-oscuro",
  },
  oscuro: {
    boton: "btn-secundario",
    pastilla: "bg-masa text-carbon",
    circulo: "bg-carbon/10 text-carbon hover:bg-carbon hover:text-masa",
    etiqueta: "text-apagado-claro",
  },
  brasa: {
    boton: "bg-carbon text-hueso",
    pastilla: "bg-carbon text-hueso",
    circulo: "bg-hollin text-hueso hover:bg-mostaza hover:text-carbon",
    etiqueta: "text-apagado-oscuro",
  },
};

/**
 * "Sumar al pedido". Una vez sumado se convierte en un contador del mismo alto:
 * [ − ]  2 en tu pedido  [ + ]
 * Con sinStock (columna Stock de la planilla destildada) queda deshabilitado: "Sin stock".
 */
export function BotonSumar({
  id,
  tipo,
  nombre,
  precio,
  foto,
  tono = "claro",
  sinStock = false,
  className,
}: {
  id: string;
  tipo: TipoItem;
  nombre: string;
  precio: number | null;
  foto?: string;
  tono?: Tono;
  sinStock?: boolean;
  className?: string;
}) {
  const { items } = usePedido();
  const cantidad = items.find((i) => i.id === id)?.cantidad ?? 0;
  const e = estilos[tono];
  const sumar = () => pedido.agregar({ id, tipo, nombre, precio, foto });

  if (sinStock) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "btn h-[52px] cursor-not-allowed py-0 text-[15px] opacity-45",
          e.boton,
          className,
        )}
      >
        Sin stock
        <span className="sr-only">: hoy no queda {nombre}</span>
      </button>
    );
  }

  if (cantidad === 0) {
    return (
      <button type="button" data-cursor="boton" onClick={sumar} className={cn("btn h-[52px] py-0 text-[15px]", e.boton, className)}>
        <span className="grid size-6 place-items-center rounded-full bg-current/15">
          <Plus size={14} weight="bold" aria-hidden />
        </span>
        Sumar al pedido
        <span className="sr-only">: {nombre}</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`${nombre} en tu pedido`}
      className={cn("inline-flex h-[52px] items-center gap-3 rounded-full p-1.5", e.pastilla, className)}
    >
      <button
        type="button"
        data-cursor="boton"
        onClick={() => pedido.cambiar(id, -1)}
        className={cn("grid size-10 place-items-center rounded-full transition-colors duration-200", e.circulo)}
      >
        <Minus size={16} weight="bold" aria-hidden />
        <span className="sr-only">Sacar una</span>
      </button>
      <span className="flex min-w-[5.5rem] flex-col items-center leading-none" aria-live="polite">
        <span key={cantidad} className="font-display text-[22px] animate-[rebote_0.4s_var(--ease-salida)] tabular-nums">
          {cantidad}
        </span>
        <span className={cn("mt-0.5 text-[11px] font-bold", e.etiqueta)}>en tu pedido</span>
      </span>
      <button
        type="button"
        data-cursor="boton"
        onClick={sumar}
        className={cn("grid size-10 place-items-center rounded-full transition-colors duration-200", e.circulo)}
      >
        <Plus size={16} weight="bold" aria-hidden />
        <span className="sr-only">Sumar una más</span>
      </button>
    </div>
  );
}
