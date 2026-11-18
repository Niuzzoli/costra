"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Minus, Plus, Trash, WhatsappLogo, X } from "@phosphor-icons/react";
import {
  cantidadTotal,
  guardarNombre,
  mensajePedido,
  nombreGuardado,
  avisoQuitados,
  pedido,
  totalPedido,
  usePedido,
} from "@/lib/pedido-store";
import { useEstado } from "@/lib/estado-store";
import { linkWhatsApp, textosCta } from "@/content/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Gato } from "@/components/Gato";
import { cn, formatoPrecio } from "@/lib/utils";

const campo =
  "w-full rounded-chico border-2 bg-carbon px-4 text-[16px] text-masa outline-none transition-colors placeholder:text-apagado-oscuro/70 focus:border-mostaza";

/**
 * Panel del pedido (dialog nativo: foco atrapado, Escape y fondo inerte de fábrica).
 * Escritorio: entra desde la derecha. Móvil: hoja desde abajo.
 * Pide el nombre (obligatorio) y aclaraciones (opcional) y abre WhatsApp con el mensaje armado.
 */
export function PedidoPanel() {
  const { items, abierto, anuncio, quitados, agotados } = usePedido();
  const estado = useEstado();
  const cerrado = estado?.abierto === false;
  const { scrollTo, frenar } = useSmoothScroll();
  const dialogo = useRef<HTMLDialogElement>(null);
  const campoNombre = useRef<HTMLInputElement>(null);
  const restaurarNombre = useRef(false);
  const [nombre, setNombre] = useState("");
  const [aclaraciones, setAclaraciones] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const idTitulo = useId();
  const idError = useId();

  const total = totalPedido(items);
  const cantidad = cantidadTotal(items);

  // Abrir / cerrar el dialog según el store; mientras está abierto, la página no scrollea.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      restaurarNombre.current = true;
      d.showModal();
      frenar(true);
      document.documentElement.style.overflow = "hidden";
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto, frenar]);

  const alCerrar = () => {
    frenar(false);
    document.documentElement.style.overflow = "";
    setEnviado(false);
    pedido.cerrar();
  };

  // Al abrir, completa (una sola vez) el nombre de la vez anterior, si lo hay
  const alAbrir = () => {
    if (!restaurarNombre.current) return;
    restaurarNombre.current = false;
    if (!nombre) setNombre(nombreGuardado());
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("Poné tu nombre así el local sabe de quién es el pedido.");
      campoNombre.current?.focus();
      return;
    }
    setError("");
    guardarNombre(nombre.trim());
    window.open(linkWhatsApp(mensajePedido(items, nombre, aclaraciones, cerrado)), "_blank", "noopener,noreferrer");
    setEnviado(true);
  };

  return (
    <>
      {/* Anuncios para lectores de pantalla cuando se suma o se saca algo */}
      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>

      <dialog
        ref={dialogo}
        aria-labelledby={idTitulo}
        onClose={alCerrar}
        onClick={(e) => e.target === e.currentTarget && pedido.cerrar()}
        onFocus={alAbrir}
        className={cn(
          "m-0 overflow-hidden border-0 bg-carbon p-0 text-masa backdrop:bg-carbon/80",
          // móvil: hoja desde abajo
          "mt-auto max-h-[90dvh] w-full max-w-none rounded-t-[20px] open:animate-[hoja-entra_0.5s_var(--ease-salida)]",
          // escritorio: panel a la derecha
          "lg:mt-0 lg:ml-auto lg:h-dvh lg:max-h-none lg:max-w-[480px] lg:rounded-none lg:border-l lg:border-masa/10 lg:open:animate-[panel-entra_0.5s_var(--ease-salida)]",
        )}
      >
        <form onSubmit={enviar} noValidate className="flex max-h-[90dvh] flex-col lg:h-dvh lg:max-h-none">
          {/* Agarradera (solo móvil) */}
          <span aria-hidden className="mx-auto mt-3 block h-1 w-10 rounded-full bg-masa/20 lg:hidden" />

          {/* Encabezado */}
          <div className="flex items-start justify-between gap-4 px-6 pt-4 pb-5 lg:pt-8">
            <div>
              {/* El foco inicial va al título (no al botón de cerrar, que mostraría el anillo de foco al abrir con el mouse) */}
              <h2 id={idTitulo} tabIndex={-1} autoFocus className="text-[40px] leading-[0.95] text-hueso outline-none">
                Tu pedido
              </h2>
              <p className="mt-1.5 text-[14px] text-apagado-oscuro">
                {cantidad === 0 ? "Todavía vacío" : `${cantidad} ${cantidad === 1 ? "producto" : "productos"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => pedido.cerrar()}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-hollin text-masa transition-[background-color,color,rotate] duration-300 hover:rotate-90 hover:bg-masa hover:text-carbon"
            >
              <X size={18} weight="bold" aria-hidden />
              <span className="sr-only">Cerrar el pedido</span>
            </button>
          </div>

          {(quitados.length > 0 || agotados.length > 0) && (
            <div className="mx-6 mb-4 flex items-start justify-between gap-3 rounded-medio border border-mostaza/60 bg-hollin p-4 text-[15px] text-masa">
              <p>{avisoQuitados(quitados, agotados)}</p>
              <button
                type="button"
                onClick={() => pedido.descartarAviso()}
                className="-m-2 grid size-9 shrink-0 place-items-center rounded-full text-apagado-oscuro hover:text-masa"
              >
                <X size={14} weight="bold" aria-hidden />
                <span className="sr-only">Cerrar aviso</span>
              </button>
            </div>
          )}

          {items.length === 0 ? (
            // Vacío
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pt-6 pb-12 text-center">
              <Gato color="masa" size={64} decorativo className="size-16 opacity-90" />
              <p className="font-display text-[30px] leading-none text-hueso uppercase">Todavía no sumaste nada</p>
              <p className="max-w-[30ch] text-[15px] text-apagado-oscuro">
                Elegí porciones o combos con &ldquo;Sumar al pedido&rdquo; y acá te armamos el mensaje para WhatsApp.
              </p>
              <button
                type="button"
                className="btn btn-primario mt-2"
                onClick={() => {
                  pedido.cerrar();
                  setTimeout(() => scrollTo("#menu"), 60);
                }}
              >
                Ver el menú
              </button>
            </div>
          ) : (
            <>
              {/* Lista */}
              <ul className="flex-1 overflow-y-auto overscroll-contain px-6" data-lenis-prevent>
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-4 border-t border-masa/10 py-4 first:border-t-0">
                    {/* Miniatura: la porción recortada, o el gato para los combos */}
                    <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-medio bg-hollin">
                      {i.foto ? (
                        <Image src={i.foto} alt="" width={64} height={64} className="size-14 rotate-[-8deg] object-contain" />
                      ) : (
                        <span className="grid size-full place-items-center bg-brasa">
                          <Gato color="carbon" size={36} decorativo className="size-9" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-display text-[22px] leading-[0.95] text-hueso uppercase sm:text-[24px]">{i.nombre}</p>
                      <p className="mt-1.5 text-[13px] text-apagado-oscuro">
                        {i.tipo === "porcion" ? "Porción" : "Combo"} · {formatoPrecio(i.precio)} c/u
                        {i.cantidad > 1 && i.precio !== null && (
                          <span className="font-bold text-masa"> · {formatoPrecio(i.precio * i.cantidad)}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-hollin p-1">
                      <button
                        type="button"
                        onClick={() => pedido.cambiar(i.id, -1)}
                        className="grid size-9 place-items-center rounded-full text-masa transition-colors hover:bg-masa hover:text-carbon"
                      >
                        {i.cantidad === 1 ? <Trash size={15} weight="bold" aria-hidden /> : <Minus size={15} weight="bold" aria-hidden />}
                        <span className="sr-only">{i.cantidad === 1 ? `Sacar ${i.nombre}` : `Una ${i.nombre} menos`}</span>
                      </button>
                      <span key={i.cantidad} className="w-7 text-center font-display text-[20px] text-hueso tabular-nums animate-[rebote_0.4s_var(--ease-salida)]">
                        {i.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => pedido.cambiar(i.id, +1)}
                        className="grid size-9 place-items-center rounded-full text-masa transition-colors hover:bg-masa hover:text-carbon"
                      >
                        <Plus size={15} weight="bold" aria-hidden />
                        <span className="sr-only">Una {i.nombre} más</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Datos y envío */}
              <div className="rounded-t-[20px] bg-hollin px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px] font-bold text-masa">Total</p>
                  {total !== null ? (
                    <p className="font-display text-[34px] leading-none text-hueso">{formatoPrecio(total)}</p>
                  ) : (
                    <p className="text-[14px] font-bold text-apagado-oscuro">A confirmar por el local</p>
                  )}
                </div>

                <div className="mt-5 grid gap-1.5">
                  <label htmlFor="pedido-nombre" className="text-[13px] font-bold text-masa">
                    ¿A nombre de quién?
                  </label>
                  <input
                    ref={campoNombre}
                    id="pedido-nombre"
                    name="nombre"
                    autoComplete="given-name"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? idError : undefined}
                    className={cn(campo, "h-12", error ? "border-brasa" : "border-masa/20")}
                    placeholder="Tu nombre"
                  />
                  {error && (
                    <p id={idError} className="text-[13px] font-bold text-brasa">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid gap-1.5">
                  <label htmlFor="pedido-aclaraciones" className="text-[13px] font-bold text-masa">
                    Aclaraciones <span className="font-medium text-apagado-oscuro">(opcional)</span>
                  </label>
                  <textarea
                    id="pedido-aclaraciones"
                    name="aclaraciones"
                    rows={2}
                    value={aclaraciones}
                    onChange={(e) => setAclaraciones(e.target.value)}
                    className={cn(campo, "resize-none border-masa/20 py-3")}
                    placeholder="Ej.: una sin albahaca"
                  />
                </div>

                <button type="submit" className="btn btn-primario mt-6 h-14 w-full text-[17px]">
                  <WhatsappLogo size={22} weight="bold" aria-hidden />
                  Enviar pedido por WhatsApp
                </button>

                {cerrado && estado && !enviado && (
                  <p className="mt-3 text-center text-[13px] font-medium text-apagado-oscuro">
                    {textosCta.aviso(estado.detalle.toLowerCase())}
                  </p>
                )}

                {enviado && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-medio bg-albahaca px-4 py-3">
                    <p className="text-[14px] font-bold text-hueso">Te abrimos WhatsApp con el pedido listo.</p>
                    <button
                      type="button"
                      onClick={() => {
                        pedido.vaciar();
                        pedido.cerrar();
                      }}
                      className="text-[14px] font-bold text-hueso underline decoration-2 underline-offset-4"
                    >
                      Ya lo mandé, vaciar
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </form>
      </dialog>
    </>
  );
}
