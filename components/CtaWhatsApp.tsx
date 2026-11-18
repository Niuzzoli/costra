"use client";

import type { ReactNode } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useEstado } from "@/lib/estado-store";
import { linkWhatsApp, mensajes, textosCta } from "@/content/site";

/**
 * Link de WhatsApp que sabe si el local está abierto. Con el local cerrado:
 * - el mensaje prellenado lo dice (encargo o "respondan cuando abran", según site.aceptaEncargos);
 * - los botones grandes (`boton`) cambian su texto, igual en todo el sitio;
 * - con `aviso`, aparece una línea "Cerrado ahora · abrimos …" debajo.
 * El botón funciona siempre.
 */
export function useHrefWhatsApp(mensaje: string = mensajes.general) {
  const estado = useEstado();
  const cerrado = estado?.abierto === false;
  return { href: linkWhatsApp(cerrado ? mensajes.fueraDeHorario(mensaje) : mensaje), estado, cerrado };
}

export function CtaWhatsApp({
  mensaje,
  className,
  children,
  boton = false,
  icono = 20,
  aviso = false,
  avisoClassName = "",
  principal = false,
}: {
  mensaje?: string;
  className?: string;
  /** Contenido libre (links secundarios). Con `boton`, el contenido es ícono + texto según el estado. */
  children?: ReactNode;
  boton?: boolean;
  icono?: number;
  aviso?: boolean;
  avisoClassName?: string;
  /** Marca los botones grandes de pedido: mientras uno está en pantalla, el botón fijo de móvil se oculta. */
  principal?: boolean;
}) {
  const { href, estado, cerrado } = useHrefWhatsApp(mensaje);
  const enlace = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="boton"
      data-cta-principal={principal ? "" : undefined}
      className={className}
    >
      {boton ? (
        <>
          <WhatsappLogo size={icono} weight="bold" aria-hidden />
          {cerrado ? textosCta.cerrado : textosCta.abierto}
        </>
      ) : (
        children
      )}
    </a>
  );
  if (!aviso) return enlace;
  return (
    <div className="flex flex-col items-start gap-2">
      {enlace}
      {cerrado && estado && (
        <p aria-live="polite" className={`max-w-[34ch] text-[14px] font-bold ${avisoClassName}`}>
          {textosCta.aviso(estado.detalle.toLowerCase())}
        </p>
      )}
    </div>
  );
}
