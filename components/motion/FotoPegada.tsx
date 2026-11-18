"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Foto "pegada" que se endereza con el scroll y un sticker que salta al entrar en pantalla.
 * La inclinación final (-2°) va por CSS: con reduced motion queda así, quieta.
 */
export function FotoPegada({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-foto-marco]",
          { rotation: 9, yPercent: 8 },
          {
            rotation: 0,
            yPercent: -4,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom 30%", scrub: true },
          },
        );
        gsap.from("[data-foto-sticker]", {
          scale: 0.4,
          rotation: -24,
          autoAlpha: 0,
          duration: 0.7,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
