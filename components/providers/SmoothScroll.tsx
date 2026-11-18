"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Ctx = {
  scrollTo: (destino: string | number | HTMLElement) => void;
  /** Frena o reanuda el scroll suave (por ejemplo, con un panel abierto encima). */
  frenar: (frenado: boolean) => void;
};

const ScrollCtx = createContext<Ctx>({
  scrollTo: (destino) => {
    if (typeof destino === "string") document.querySelector(destino)?.scrollIntoView();
  },
  frenar: () => {},
});

export const useSmoothScroll = () => useContext(ScrollCtx);

/**
 * Un solo loop de animación para toda la página: el ticker de GSAP mueve Lenis
 * y ScrollTrigger se actualiza en cada evento de scroll de Lenis.
 * - Con prefers-reduced-motion no se crea Lenis (scroll nativo, sin animaciones).
 * - En táctil Lenis no intercepta el gesto (syncTouch apagado): scroll nativo.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Si el usuario activa reduced motion con la página abierta, se apaga Lenis.
    const onChange = () => {
      if (reduce.matches) lenis.destroy();
    };
    reduce.addEventListener("change", onChange);

    return () => {
      reduce.removeEventListener("change", onChange);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo: Ctx["scrollTo"] = (destino) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(destino, { offset: typeof destino === "number" ? 0 : -64 });
      return;
    }
    const el = typeof destino === "string" ? document.querySelector(destino) : destino;
    if (typeof el === "number") window.scrollTo({ top: el });
    else el?.scrollIntoView();
  };

  const frenar: Ctx["frenar"] = (frenado) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (frenado) lenis.stop();
    else lenis.start();
  };

  return <ScrollCtx.Provider value={{ scrollTo, frenar }}>{children}</ScrollCtx.Provider>;
}
