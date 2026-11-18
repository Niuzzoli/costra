"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Pause, Play } from "@phosphor-icons/react";
import { Gato } from "@/components/Gato";
import { cinta as frasesCinta, DIAS_QUE_ABRE } from "@/content/textos";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Cinta mostaza (marquee). Un tween infinito cuya timeScale sigue a la velocidad del scroll
 * (hasta 3×) y cambia de dirección al scrollear hacia arriba.
 * - Se pausa con el botón (WCAG 2.2.2) y cuando está fuera de pantalla. No se frena con el mouse encima:
 *   al scrollear con el cursor quieto, la cinta pasaba por debajo del puntero y se quedaba clavada.
 * - Con reduced motion queda quieta y el botón no se muestra.
 */
/** dias: los días que abre según la planilla ("Martes a domingo"), o null si no abre ninguno. */
export function Cinta({ dias }: { dias: string | null }) {
  const cinta = frasesCinta.flatMap((f) => (f === DIAS_QUE_ABRE ? (dias ? [dias] : []) : [f]));
  const ref = useRef<HTMLDivElement>(null);
  const loopRef = useRef<gsap.core.Tween | null>(null);
  const pausadaRef = useRef(false);
  const [pausada, setPausada] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const loop = gsap.to("[data-cinta-pista]", {
          xPercent: -50,
          duration: 28,
          ease: "none",
          repeat: -1,
        });
        loopRef.current = loop;
        // Arranca "lejos" del cero para poder ir en reversa sin frenar contra el inicio.
        loop.totalTime(loop.duration() * 500);
        let direccion = 1;

        const st = ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            if (!self.isActive) loop.pause();
            else if (!pausadaRef.current) loop.play();
          },
          onUpdate: (self) => {
            if (pausadaRef.current) return;
            direccion = self.direction;
            const extra = Math.min(Math.abs(self.getVelocity()) / 400, 2);
            gsap.to(loop, {
              timeScale: direccion * (1 + extra),
              duration: 0.25,
              overwrite: true,
              onComplete: () => {
                gsap.to(loop, { timeScale: direccion, duration: 1.2, ease: "power2.out" });
              },
            });
          },
        });
        return () => {
          st.kill();
          loopRef.current = null;
        };
      });
    },
    { scope: ref },
  );

  const alternar = () => {
    const loop = loopRef.current;
    const nueva = !pausadaRef.current;
    pausadaRef.current = nueva;
    setPausada(nueva);
    if (!loop) return;
    if (nueva) loop.pause();
    else loop.play();
  };

  // Dos copias idénticas para que el loop en -50% sea continuo.
  const grupo = (copia: number) => (
    <div className="flex shrink-0 items-center" aria-hidden={copia > 0}>
      {cinta.map((frase, i) => (
        <span key={`${copia}-${i}`} className="flex items-center">
          <span className="px-6 md:px-8">{frase}</span>
          {/* Gato a 32px con su espacio libre (25%) como separador */}
          <span className="px-2">
            <Gato color="carbon" size={32} decorativo className="size-8" />
          </span>
        </span>
      ))}
    </div>
  );

  return (
    // Costura entre secciones: mitad de arriba carbón (hero), mitad de abajo masa (menú).
    // La cinta inclinada es más ancha que la pantalla y tapa la costura de punta a punta.
    // Sin z-index a propósito: con z-10 el bloque se componía como capa aparte (se superpone al hero
    // animado) y en pantallas con densidad fraccionaria (ej. 2.625x) dejaba una línea mostaza en el borde de abajo.
    // -mb-[2px]: se monta 2px sobre el menú para que por la unión no asome el carbón de <main>.
    // Fondo con dos bloques y sin color de base: cada borde (arriba carbón sobre el hero, abajo masa
    // sobre el menú) queda del mismo color que lo que tiene al lado, así no aparecen líneas en medio píxel.
    <div className="relative -mb-[2px] overflow-hidden py-5 pb-[calc(1.25rem+2px)] md:py-7 md:pb-[calc(1.75rem+2px)]">
    <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-carbon" />
    <div aria-hidden className="absolute inset-x-0 top-1/2 bottom-0 bg-masa" />
    <div
      ref={ref}
      data-cursor-tema="claro"
      className="relative -mx-[3%] w-[106%] -rotate-1 overflow-hidden bg-mostaza py-4 text-carbon md:py-5"
    >
      <p className="sr-only">{cinta.join(". ")}</p>
      <div
        data-cinta-pista
        aria-hidden
        className="flex w-max font-display text-[34px] leading-none uppercase will-change-transform md:text-[44px]"
      >
        {grupo(0)}
        {grupo(1)}
      </div>
      {/* Bloque mostaza sólido detrás del botón para que no pise las letras */}
      <div className="absolute inset-y-0 right-[3%] flex items-center bg-mostaza px-3 motion-reduce:hidden md:px-5">
      <button
        type="button"
        onClick={alternar}
        aria-pressed={pausada}
        className="grid size-11 place-items-center rounded-full bg-carbon text-mostaza"
      >
        {pausada ? <Play size={18} weight="fill" aria-hidden /> : <Pause size={18} weight="fill" aria-hidden />}
        <span className="sr-only">{pausada ? "Reanudar la cinta" : "Pausar la cinta"}</span>
      </button>
      </div>
    </div>
    </div>
  );
}
