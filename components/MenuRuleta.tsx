"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Porcion } from "@/lib/planilla/tipos";
import { FOTO_GENERICA } from "@/lib/planilla/parsear";
import { BotonSumar } from "@/components/BotonSumar";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { cn, formatoPrecio } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Avance con una pausa breve en cada porción (ease suave, sin frenazos). */
const detente = (f: number) => {
  const t = Math.min(Math.max((f - 0.08) / 0.84, 0), 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Menú como ruleta. Las porciones están en círculo y giran con el scroll; la que llega al frente queda vertical.
 * - Escritorio: la rueda asoma por la izquierda y la porción activa mira hacia la derecha, donde está su info.
 * - Móvil: la rueda asoma desde arriba; abajo, la fila de nombres y la info.
 * La sección usa `position: sticky` (sin pin de GSAP): en el celular no pelea con la barra del navegador.
 * Con reduced motion la ruleta salta de porción en porción, sin giro animado.
 */
export function MenuRuleta({ porciones }: { porciones: Porcion[] }) {
  const n = porciones.length;
  const paso = 360 / n;
  const raiz = useRef<HTMLDivElement>(null);
  const rueda = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(0);
  // Fotos que no cargaron (link de Drive roto o sin compartir): se reemplazan por la genérica.
  const [rotas, setRotas] = useState<ReadonlySet<string>>(new Set());
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      const porcionesEl = gsap.utils.toArray<HTMLElement>("[data-ruleta-porcion]");
      const girar = gsap.quickSetter(rueda.current, "rotate", "deg");
      const estado = { x: 0 };

      const pintar = (x: number) => {
        const i = Math.floor(x);
        const pos = Math.min(i + detente(x - i), n - 1);
        girar(-pos * paso);
        porcionesEl.forEach((el, j) => el.style.setProperty("--cerca", String(1 - Math.min(Math.abs(pos - j), 1))));
        const actual = Math.round(pos);
        setActiva((a) => (a === actual ? a : actual));
      };
      pintar(0);

      const mm = gsap.matchMedia();
      mm.add({ quieto: "(prefers-reduced-motion: reduce)", movil: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
        const quieto = Boolean(ctx.conditions?.quieto);
        const st = ScrollTrigger.create({
          trigger: raiz.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const destino = self.progress * (n - 1);
            if (quieto) return pintar(Math.round(destino));
            gsap.to(estado, {
              x: destino,
              duration: 1.1,
              ease: "power2.out",
              overwrite: true,
              onUpdate: () => pintar(estado.x),
            });
          },
        });
        return () => st.kill();
      });
    },
    { scope: raiz },
  );

  /** Lleva el scroll al punto donde la porción `i` queda al frente. */
  const irA = (i: number) => {
    const el = raiz.current;
    if (!el) return;
    const inicio = el.getBoundingClientRect().top + window.scrollY;
    const recorrido = el.offsetHeight - window.innerHeight;
    scrollTo(inicio + (recorrido * i) / Math.max(n - 1, 1));
  };

  return (
    <div
      ref={raiz}
      className="relative"
      style={{ height: `calc(100svh + ${(n - 1) * 80}svh)` }}
    >
      {/* Máscara arriba: las porciones aparecen difuminadas debajo del título, no cortadas en seco */}
      <div className="sticky top-0 h-[100svh] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_16svh)] lg:[mask-image:linear-gradient(to_bottom,transparent,black_18vh)]">
        {/* La rueda: un punto (el centro) del que salen las porciones */}
        <div
          ref={rueda}
          aria-hidden
          className="absolute top-[10svh] left-1/2 size-0 will-change-transform [--base:90deg] [--h:30svh] [--r:26svh] lg:top-1/2 lg:left-[6vw] lg:[--base:0deg] lg:[--h:48vh] lg:[--r:37vh] max-lg:[@media(max-height:700px)]:top-[8svh] max-lg:[@media(max-height:700px)]:[--h:26svh] max-lg:[@media(max-height:700px)]:[--r:22svh]"
        >
          {porciones.map((p, j) => (
            <div
              key={p.foto + j}
              data-ruleta-porcion
              className="absolute top-0 left-0"
              style={
                {
                  "--cerca": j === 0 ? 1 : 0,
                  width: "calc(var(--h) * 0.77)",
                  height: "var(--h)",
                  marginLeft: "calc(var(--h) * -0.385)",
                  marginTop: "calc(var(--h) * -0.5)",
                  // La porción se contra-rota: al llegar al frente queda vertical (punta hacia abajo).
                  transform: `rotate(calc(var(--base) + ${j * paso}deg)) translateX(var(--r)) rotate(calc(var(--base) * -1))`,
                } as CSSProperties
              }
            >
              <div
                className="relative size-full"
                style={{
                  transform: "scale(calc(0.84 + 0.26 * var(--cerca)))",
                  opacity: "calc(0.4 + 0.6 * var(--cerca))",
                }}
              >
                <Image
                  src={rotas.has(p.foto) ? FOTO_GENERICA : p.foto}
                  onError={() => setRotas((r) => (r.has(p.foto) ? r : new Set(r).add(p.foto)))}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 340px, 45vw"
                  className="object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* La info de la porción activa */}
        <div className="absolute inset-x-0 top-[51svh] max-lg:[@media(max-height:700px)]:top-[45svh] flex flex-col px-4 md:px-8 lg:inset-y-0 lg:top-0 lg:right-0 lg:left-1/2 lg:flex lg:flex-col lg:justify-center lg:pr-[max(2rem,calc((100vw-1280px)/2+2rem))] lg:pl-8">
          <div className="relative min-h-[230px] lg:min-h-[330px]">
            {porciones.map((p, i) => (
              <div
                key={p.nombre + i}
                inert={i !== activa}
                aria-hidden={i !== activa}
                className={cn(
                  "absolute inset-x-0 top-0 transition-[opacity,translate] duration-500 ease-salida",
                  i === activa ? "translate-y-0 opacity-100" : i < activa ? "-translate-y-6 opacity-0" : "translate-y-6 opacity-0",
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[clamp(56px,8vw,104px)] leading-[0.95]">{p.nombre}</h3>
                  {p.vegetariana && (
                    <span className="etiqueta rounded-full bg-albahaca px-3 py-1 text-[12px] text-hueso">Veggie</span>
                  )}
                  {p.sinStock && (
                    <span className="etiqueta rounded-full border-2 border-carbon px-3 py-0.5 text-[12px] text-carbon">Sin stock</span>
                  )}
                </div>
                <p className="mt-3 max-w-[40ch] text-[17px] leading-snug text-apagado-claro lg:text-[19px]">
                  {p.descripcion}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-7">
                  <p className="font-display text-[44px] leading-none text-brasa-oscura lg:text-[56px]">
                    {formatoPrecio(p.precio)}
                    <span className="ml-2 font-texto text-[14px] font-bold text-apagado-claro normal-case">la porción</span>
                  </p>
                  <BotonSumar id={`porcion:${p.nombre}`} tipo="porcion" nombre={p.nombre} precio={p.precio} foto={p.foto} tono="claro" sinStock={p.sinStock} />
                </div>
              </div>
            ))}
          </div>

          {/* Índice: salta a cada porción. En móvil va arriba del nombre (abajo está el botón fijo de WhatsApp) */}
          <ol
            className="order-first -mx-4 mb-2 flex gap-x-4 overflow-x-auto px-4 [scrollbar-width:none] md:-mx-8 md:px-8 lg:order-none lg:mx-0 lg:mt-10 lg:mb-0 lg:flex-wrap lg:gap-x-5 lg:gap-y-1 lg:overflow-visible lg:px-0"
            aria-label="Porciones del menú"
          >
            {porciones.map((p, i) => (
              <li key={p.nombre + i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-current={i === activa ? "true" : undefined}
                  className={cn(
                    "relative inline-flex min-h-11 items-center text-[15px] font-bold transition-colors",
                    i === activa ? "text-carbon" : "text-apagado-claro hover:text-carbon",
                  )}
                >
                  {p.nombre}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-2 h-[2px] origin-left bg-brasa-oscura transition-transform duration-300 ease-salida",
                      i === activa ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
