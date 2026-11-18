"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Entrada del cierre: el footer está fijo DEBAJO de la página (sticky bottom-0, detrás de <main>).
 * Al llegar al final, el contenido sube como un telón y lo descubre. Mientras tanto, ligado al scroll:
 * las letras de "Pedí tu porción" suben una por una y después entran el gato y los datos.
 * Con reduced motion queda el telón (es scroll nativo) pero sin animaciones.
 */
export function PieEscena({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pie = ref.current!.closest("footer") as HTMLElement;
        const tl = gsap.timeline({
          scrollTrigger: {
            start: () => ScrollTrigger.maxScroll(window) - pie.offsetHeight,
            end: "max",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        tl.from("[data-pie-letra]", { yPercent: 115, rotate: 6, ease: "power3.out", stagger: 0.06, duration: 0.6 }, 0)
          .from("[data-pie-gato]", { yPercent: 60, rotate: -14, autoAlpha: 0, ease: "back.out(2)", duration: 0.45 }, 0.45)
          .from("[data-pie-dato]", { y: 24, autoAlpha: 0, ease: "power2.out", stagger: 0.08, duration: 0.4 }, 0.55);
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
