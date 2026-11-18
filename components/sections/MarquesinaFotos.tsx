"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { fotosMarquesina, type Foto } from "@/content/equipo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Marquesina de fotos (separa Combos de Nosotros): dos filas que avanzan en sentidos opuestos.
 * Igual que la cinta mostaza, la velocidad sigue al scroll (hasta 3×) y el sentido se invierte al subir.
 * Se pausa al pasar el mouse y fuera de pantalla. Con reduced motion queda quieta.
 */
export function MarquesinaFotos() {
  const ref = useRef<HTMLElement>(null);
  const loops = useRef<gsap.core.Tween[]>([]);

  const mitad = Math.ceil(fotosMarquesina.length / 2);
  const filas = [fotosMarquesina.slice(0, mitad), fotosMarquesina.slice(mitad)];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pistas = gsap.utils.toArray<HTMLElement>("[data-foto-pista]");
        // Fila 0 hacia la izquierda, fila 1 hacia la derecha.
        loops.current = pistas.map((pista, i) => {
          const t =
            i === 0
              ? gsap.fromTo(pista, { xPercent: 0 }, { xPercent: -50, duration: 115, ease: "none", repeat: -1 })
              : gsap.fromTo(pista, { xPercent: -50 }, { xPercent: 0, duration: 100, ease: "none", repeat: -1 });
          t.totalTime(t.duration() * 500); // lejos del cero: puede ir en reversa sin frenar
          return t;
        });

        let direccion = 1;
        const st = ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => loops.current.forEach((l) => (self.isActive ? l.play() : l.pause())),
          onUpdate: (self) => {
            direccion = self.direction;
            const extra = Math.min(Math.abs(self.getVelocity()) / 400, 2);
            loops.current.forEach((l) =>
              gsap.to(l, {
                timeScale: direccion * (1 + extra),
                duration: 0.25,
                overwrite: true,
                onComplete: () => {
                  gsap.to(l, { timeScale: direccion, duration: 1.2, ease: "power2.out" });
                },
              }),
            );
          },
        });
        return () => {
          st.kill();
          loops.current = [];
        };
      });
    },
    { scope: ref },
  );

  const hover = (dentro: boolean) => {
    loops.current.forEach((l) =>
      gsap.to(l, { timeScale: dentro ? 0 : 1, duration: 0.6, ease: "power2.out", overwrite: true }),
    );
  };

  const item = (f: Foto, clave: string, duplicada: boolean) => (
    <figure
      key={clave}
      data-cursor="foto"
      className="group relative h-[170px] shrink-0 overflow-hidden rounded-medio bg-hollin md:h-[260px]"
      style={{ aspectRatio: `${f.ancho} / ${f.alto}` }}
    >
      <Image
        src={f.src}
        alt={duplicada ? "" : f.alt}
        fill
        sizes="(min-width: 768px) 350px, 230px"
        className="object-cover transition-transform duration-700 ease-salida group-hover:scale-105"
      />
    </figure>
  );

  return (
    <section
      ref={ref}
      aria-label="Fotos de Costra"
      className="relative overflow-hidden bg-carbon py-12 md:py-16"
      onPointerEnter={(e) => e.pointerType === "mouse" && hover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && hover(false)}
    >
      <div className="flex flex-col gap-3 md:gap-4">
        {filas.map((fila, i) => (
          <div key={i} className="overflow-hidden">
            {/* Cada tanda repite la fila 3 veces (más ancha que cualquier pantalla) y hay dos tandas: el loop en -50% es continuo */}
            <div data-foto-pista className="flex w-max gap-3 will-change-transform md:gap-4">
              {[0, 1, 2, 3, 4, 5].flatMap((r) => fila.map((f, j) => item(f, `${i}-${r}-${j}`, r > 0)))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
