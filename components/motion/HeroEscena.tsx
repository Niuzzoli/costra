"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Parallax del hero ligado al scroll (scrub, sin pin):
 * - el título escala y sube más lento que la página
 * - la porción, por delante del título, sube más rápido y gira un poco: se "despega" del nombre
 * - el texto y los botones solo se desplazan (no se apagan mientras siguen en pantalla)
 */
export function HeroEscena({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: ref.current, start: "top top", end: "bottom top", scrub: true };

        gsap.to("[data-hero-titulo]", { scale: 1.1, yPercent: -30, ease: "none", scrollTrigger: st });
        gsap.to("[data-hero-pizza]", { yPercent: -95, rotate: 24, scale: 1.1, ease: "none", scrollTrigger: st });
        gsap.to("[data-hero-texto]", { yPercent: -4, ease: "none", scrollTrigger: st });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="inicio" aria-labelledby="titulo-hero" className="relative isolate overflow-hidden">
      {children}
    </section>
  );
}
