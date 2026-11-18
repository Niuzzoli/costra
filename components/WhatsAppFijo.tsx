"use client";

import { useEffect, useState } from "react";
import { Basket, WhatsappLogo } from "@phosphor-icons/react";
import { cantidadTotal, pedido, usePedido } from "@/lib/pedido-store";
import { useHrefWhatsApp } from "@/components/CtaWhatsApp";
import { cn } from "@/lib/utils";
import { textosCta } from "@/content/site";

/**
 * Botón grande fijo abajo, solo en móvil/tablet. Se oculta mientras se ve el hero o cualquier
 * botón grande de pedido ([data-cta-principal]): nunca hay dos "Pedir por WhatsApp" a la vez,
 * y nunca falta uno. Con el local cerrado, usa los mismos textos que el resto (content/site.ts).
 */
export function WhatsAppFijo() {
  const [visible, setVisible] = useState(false);
  const [sobreBrasa, setSobreBrasa] = useState(false);
  const { href, cerrado } = useHrefWhatsApp();
  const cantidad = cantidadTotal(usePedido().items);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const ctas = Array.from(document.querySelectorAll<HTMLElement>("[data-cta-principal]"));
    const enPantalla = new Set<Element>();

    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => (e.isIntersecting ? enPantalla.add(e.target) : enPantalla.delete(e.target)));
      setVisible(enPantalla.size === 0);
    });
    if (hero) io.observe(hero);
    ctas.forEach((c) => io.observe(c));

    // Sobre el cierre brasa el botón pasa a carbón (brasa sobre brasa no se ve).
    // El footer está fijo debajo del contenido: se ve recién cuando el final de <main> sube por encima
    // de la franja de abajo, donde está el botón. Se mira un marcador al final de <main>.
    const fin = document.querySelector("[data-fin-contenido]");
    const ioPie = new IntersectionObserver(
      ([e]) => setSobreBrasa(e.isIntersecting || e.boundingClientRect.top < 0),
      { rootMargin: "0px 0px -96px 0px" },
    );
    if (fin) ioPie.observe(fin);

    return () => {
      io.disconnect();
      ioPie.disconnect();
    };
  }, []);

  return (
    <div
      data-fuera-del-menu
      data-whatsapp-fijo
      className={cn(
        "fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 transition-[translate,opacity] duration-300 ease-salida lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      {cantidad > 0 ? (
        // Con algo sumado, el botón lleva al pedido (ahí se pide el nombre y se arma el mensaje)
        <button
          type="button"
          onClick={() => pedido.abrir()}
          tabIndex={visible ? 0 : -1}
          aria-hidden={!visible}
          className={cn("btn w-full py-4 text-[18px]", sobreBrasa ? "bg-carbon text-hueso" : "btn-primario")}
        >
          <Basket size={24} weight="bold" aria-hidden />
          Ver tu pedido · {cantidad}
        </button>
      ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        className={cn(
          "btn w-full flex-col gap-0 py-3 text-[18px]",
          sobreBrasa ? "bg-carbon text-hueso" : "btn-primario",
        )}
      >
        <span className="inline-flex items-center gap-2.5">
          <WhatsappLogo size={24} weight="bold" aria-hidden />
          {cerrado ? textosCta.cerrado : textosCta.abierto}
        </span>
        {cerrado && <span className="text-[13px] font-medium">Ahora estamos cerrados</span>}
      </a>
      )}
    </div>
  );
}
