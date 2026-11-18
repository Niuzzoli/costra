"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Cursor propio y sutil. Solo con mouse/trackpad (pointer: fine) y sin reduced motion.
 * - Punto masa que sigue al puntero (quickTo usa el ticker de GSAP: mismo loop que Lenis).
 * - Sobre botones/links: punto mostaza más chico (no tapa el texto del link).
 * - Sobre fotos: disco mostaza (sin texto: las fotos no son clickeables, no prometemos una acción).
 * - Sobre superficies claras ([data-cursor-tema="claro"]): punto y aro en carbón.
 */
/** Tamaño del punto normal (16px) respecto del disco grande (42px). */
const PUNTO = 16 / 42;

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const disco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fino = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fino.matches || reduce.matches || !ref.current || !disco.current) return;

    const el = ref.current;
    const d = disco.current;
    const root = document.documentElement;
    root.classList.add("cursor-propio");

    const x = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3.out" });
    let modo = "";
    let visible = false;

    gsap.set(d, { scale: PUNTO });

    const setModo = (nuevo: string) => {
      if (nuevo === modo) return;
      modo = nuevo;
      d.dataset.modo = nuevo;
      // El disco se dibuja grande (42px) y se achica: escalar hacia abajo no pixelea.
      const escala = nuevo === "foto" ? 1 : nuevo === "boton" ? PUNTO * 0.75 : PUNTO;
      gsap.to(d, { scale: escala, duration: 0.35, ease: "expo.out" });
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { opacity: 1, duration: 0.2 });
      }
      x(e.clientX);
      y(e.clientY);
      const t = e.target as Element | null;
      const tema = t?.closest?.("[data-cursor-tema=\"claro\"]") ? "claro" : "";
      if (d.dataset.tema !== tema) d.dataset.tema = tema;
      const objetivo = t?.closest?.("[data-cursor], a, button");
      if (!objetivo) return setModo("");
      setModo(objetivo.getAttribute("data-cursor") === "foto" ? "foto" : "boton");
    };
    const salir = () => {
      visible = false;
      gsap.to(el, { opacity: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", mover, { passive: true });
    root.addEventListener("pointerleave", salir);
    return () => {
      window.removeEventListener("pointermove", mover);
      root.removeEventListener("pointerleave", salir);
      root.classList.remove("cursor-propio");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 size-0 opacity-0 will-change-transform"
    >
      <div
        ref={disco}
        data-modo=""
        className="absolute -top-[21px] -left-[21px] size-[42px] rounded-full bg-masa data-[modo=boton]:bg-mostaza data-[modo=foto]:bg-mostaza data-[tema=claro]:bg-carbon data-[tema=claro]:data-[modo=boton]:bg-brasa-oscura data-[tema=claro]:data-[modo=foto]:bg-mostaza"
      />
    </div>
  );
}
