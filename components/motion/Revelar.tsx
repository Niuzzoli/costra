"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Separación entre elementos, en segundos. */
  escalon?: number;
  /** Rotación inicial (en grados) para las tarjetas que "caen" sobre la mesa. */
  giro?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Hace entrar escalonados a los hijos marcados con [data-revelar] cuando aparecen en pantalla.
 * Los [data-revelar-foto] además hacen un zoom-out interno (scale de la imagen).
 * Sin JS o con reduced motion, todo queda visible y quieto.
 */
export function Revelar<T extends ElementType = "div">({
  as,
  children,
  escalon = 0.12,
  giro = 0,
  ...props
}: Props<T>) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-revelar]");
        gsap.set(items, { autoAlpha: 0, y: 56, rotate: (i) => (giro ? (i % 2 ? giro : -giro) : 0) });
        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (lote) =>
            gsap.to(lote, {
              autoAlpha: 1,
              y: 0,
              rotate: 0,
              duration: 0.9,
              ease: "expo.out",
              stagger: escalon,
              overwrite: true,
            }),
        });

        gsap.utils.toArray<HTMLElement>("[data-revelar-foto]").forEach((foto) => {
          gsap.fromTo(
            foto,
            { scale: 1.18 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: foto, start: "top bottom", end: "bottom 40%", scrub: true },
            },
          );
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
}
