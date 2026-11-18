"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { List, X } from "@phosphor-icons/react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Gato } from "@/components/Gato";
import { CtaWhatsApp } from "@/components/CtaWhatsApp";
import { BotonPedido } from "@/components/BotonPedido";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fondo de la barra al scrollear.
 * true: carbón translúcido con desenfoque (se ve el contenido borroso por detrás). PRUEBA:
 *   la guía de marca prohíbe el "vidrio esmerilado"; si no convence, poné false.
 * false: carbón sólido (lo que pide el DESIGN.md).
 */
const FONDO_BORROSO = true;

export const secciones = [
  { id: "menu", label: "Menú" },
  { id: "combos", label: "Combos" },
  { id: "nosotros", label: "Nosotros" },
  { id: "horarios", label: "Horarios" },
];

/** hayCombos: sin combos disponibles en la planilla, la sección no existe y su link tampoco. */
export function Nav({ hayCombos = true }: { hayCombos?: boolean }) {
  const links = hayCombos ? secciones : secciones.filter((s) => s.id !== "combos");
  const { scrollTo } = useSmoothScroll();
  const barra = useRef<HTMLDivElement>(null);
  const [compacta, setCompacta] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  // El panel sigue montado mientras corre la animación de cierre.
  const [mostrar, setMostrar] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const abrir = () => {
    setAbierto(true);
    setMostrar(true);
  };

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Barra de progreso: scaleX con el progreso total de la página (sin re-render).
    const setX = gsap.quickSetter(barra.current, "scaleX");
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setX(self.progress),
      }),
    );

    // Compactar al bajar del primer pantallazo (setState con el mismo valor no re-renderiza).
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setCompacta(self.scroll() > 80),
        onRefresh: (self) => setCompacta(self.scroll() > 80),
      }),
    );

    // Sección activa.
    secciones.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setActiva(id);
            else setActiva((a) => (a === id ? null : a));
          },
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = abierto ? "hidden" : "";
    // Con el menú abierto, el resto de la página queda inerte: el foco no puede salir del menú.
    const fondo = document.querySelectorAll<HTMLElement>("main, footer, [data-fuera-del-menu]");
    fondo.forEach((el) => (el.inert = abierto));
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      fondo.forEach((el) => (el.inert = false));
    };
  }, [abierto]);

  // Escalera: los ítems entran por la izquierda uno detrás del otro y salen en el orden inverso.
  // Siempre anima desde donde está (si se reabre a mitad del cierre, no salta).
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el || !mostrar) return;
    const items = el.querySelectorAll<HTMLElement>("[data-menu-item]");
    const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline();
    if (abierto) {
      if (!el.dataset.listo) {
        gsap.set(el, { autoAlpha: 0 });
        gsap.set(items, { x: -56, autoAlpha: 0 });
        el.dataset.listo = "1";
      }
      if (quieto) tl.set(el, { autoAlpha: 1 }).set(items, { x: 0, autoAlpha: 1 });
      else
        tl.to(el, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }).to(
          items,
          { x: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", stagger: 0.07 },
          0.05,
        );
    } else {
      if (quieto) tl.set(items, { x: -56, autoAlpha: 0 }).set(el, { autoAlpha: 0 });
      else
        tl.to(items, { x: -56, autoAlpha: 0, duration: 0.3, ease: "power2.in", stagger: { each: 0.05, from: "end" } }).to(
          el,
          { autoAlpha: 0, duration: 0.18, ease: "power1.in" },
          "-=0.1",
        );
      tl.call(() => setMostrar(false));
    }
    return () => {
      tl.kill();
    };
  }, [abierto, mostrar]);

  const ir = (e: MouseEvent<HTMLAnchorElement>, destino: string) => {
    e.preventDefault();
    setAbierto(false);
    scrollTo(destino === "#inicio" ? 0 : destino);
    history.replaceState(null, "", destino);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={cn(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          abierto || mostrar
            ? "border-masa/10 bg-carbon"
            : compacta
              ? FONDO_BORROSO
                ? "border-masa/10 bg-carbon/65 backdrop-blur-xl"
                : "border-masa/10 bg-carbon"
              : "border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Principal"
          className={cn(
            // Grilla de 3 columnas: logo | links (centrados de verdad) | botón del menú móvil
            "mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 transition-[height] duration-300 ease-salida md:px-8",
            compacta ? "h-14" : "h-[72px] md:h-20",
          )}
        >
          <a
            href="#inicio"
            onClick={(e) => ir(e, "#inicio")}
            className="flex items-center gap-3 justify-self-start"
            aria-label="Costra Pizza, volver al inicio"
          >
            <Gato decorativo size={compacta ? 32 : 40} className="transition-[width,height] duration-300" />
            <span className="font-display text-[26px] leading-none tracking-[0.04em] text-hueso uppercase">Costra</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => ir(e, `#${id}`)}
                  aria-current={activa === id ? "true" : undefined}
                  className={cn(
                    "group relative inline-flex h-11 items-center px-3 text-[15px] font-medium transition-colors",
                    activa === id ? "text-hueso" : "text-apagado-oscuro hover:text-hueso",
                  )}
                >
                  {label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 bottom-1 h-[3px] origin-left rounded-full bg-mostaza transition-transform duration-300 ease-salida",
                      activa === id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            <BotonPedido />
            <button
              type="button"
              onClick={() => (abierto ? setAbierto(false) : abrir())}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              className="grid size-11 place-items-center rounded-full border-2 border-masa text-masa lg:hidden"
            >
              {abierto ? <X size={22} weight="bold" aria-hidden /> : <List size={22} weight="bold" aria-hidden />}
              <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
            </button>
          </div>
        </nav>
        <div className="h-[3px] w-full" aria-hidden>
          <div ref={barra} className="h-full w-full origin-left scale-x-0 bg-brasa" />
        </div>
      </div>

      {/* Menú móvil: lista tipográfica (sin números: la numeración grande es solo de las secciones) */}
      <div
        ref={panel}
        id="menu-movil"
        hidden={!mostrar}
        inert={!abierto}
        className="h-[calc(100dvh-56px)] overflow-y-auto bg-carbon px-4 pt-6 pb-10 lg:hidden"
      >
        <ol className="flex flex-col">
          {links.map(({ id, label }) => (
            <li key={id} data-menu-item className="border-b border-masa/10">
              <a
                href={`#${id}`}
                onClick={(e) => ir(e, `#${id}`)}
                className="flex items-baseline py-4 font-display text-[44px] leading-none text-hueso uppercase"
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
        <div data-menu-item className="mt-8 [&>a]:w-full">
          <CtaWhatsApp boton icono={20} className="btn btn-primario w-full" />
        </div>
      </div>
    </header>
  );
}
