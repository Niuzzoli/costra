import Image from "next/image";
import { HeroEscena } from "@/components/motion/HeroEscena";
import { site } from "@/content/site";
import { heroPorcion } from "@/content/textos";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { NavLink } from "@/components/NavLink";
import { EstadoAbierto } from "@/components/EstadoAbierto";

const letras = ["C", "O", "S", "T", "R", "A"];

/**
 * Hero centrado: "COSTRA" gigante con una porción real por delante (PNG recortado de /public/pizzas).
 * Fondo carbón liso. Entrada: letras que suben (CSS) y la porción que cae girando sobre el título.
 */
/** dias: los días que abre según la planilla ("Martes a domingo"), o null si no abre ninguno. */
export function Hero({ dias }: { dias: string | null }) {
  const cuando = !dias ? "" : dias === "Todos los días" ? ", todos los días" : `, de ${dias.charAt(0).toLowerCase()}${dias.slice(1)}`;
  return (
    <HeroEscena>
      <div className="mx-auto flex min-h-[100dvh] max-w-[1280px] flex-col items-center justify-center px-4 pt-24 pb-16 text-center md:px-8 md:pt-28">
        <div className="relative py-12 md:py-16">
          <div data-hero-titulo className="origin-center will-change-transform">
            <h1
              id="titulo-hero"
              className="flex justify-center gap-[0.07em] text-[clamp(96px,27vw,230px)] leading-[0.86] text-hueso"
              aria-label={`Costra Pizza: ${site.bajada.charAt(0).toLowerCase()}${site.bajada.slice(1)} en ${site.ciudad}`}
            >
              {letras.map((l, i) => (
                <span key={i} className="overflow-hidden pb-[0.04em]" aria-hidden>
                  <span
                    className={`hero-letra inline-block ${i >= 3 ? "text-brasa" : ""}`}
                    style={{ animationDelay: `${120 + i * 70}ms` }}
                  >
                    {l}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          {/* La porción, por delante del título */}
          <div
            data-hero-pizza
            className="pointer-events-none absolute top-1/2 left-1/2 w-[clamp(132px,19vw,250px)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <Image
              src={heroPorcion.foto}
              alt={heroPorcion.alt}
              width={heroPorcion.ancho}
              height={heroPorcion.alto}
              preload
              fetchPriority="high"
              sizes="(min-width: 1024px) 250px, 36vw"
              className="hero-pizza h-auto w-full rotate-[-14deg] select-none"
              draggable={false}
            />
          </div>
        </div>

        <div data-hero-texto className="flex flex-col items-center">
          <p
            className="hero-entra inline-flex items-center rounded-full border border-masa/20 px-4 py-1.5 text-[14px] font-medium text-masa"
            style={{ animationDelay: "560ms" }}
          >
            Pizza tipo New York, por porciones
          </p>
          <p
            className="hero-entra mt-5 max-w-[36ch] text-[18px] leading-snug text-masa md:text-[20px]"
            style={{ animationDelay: "640ms" }}
          >
            Masa fina, borde crocante y mucho queso. En el centro de Cipolletti{cuando}.
          </p>
          <div
            className="hero-entra mt-7 flex flex-wrap justify-center gap-2 sm:gap-3"
            style={{ animationDelay: "720ms" }}
          >
            <NavLink href="#menu" className="btn btn-primario" data-cursor="boton">
              Ver menú
            </NavLink>
            <NavLink href="#horarios" className="btn btn-secundario" data-cursor="boton">
              <Clock size={20} weight="bold" aria-hidden />
              Horarios
            </NavLink>
          </div>
          <div className="hero-entra mt-5" style={{ animationDelay: "800ms" }}>
            <EstadoAbierto compacto />
          </div>
        </div>
      </div>
    </HeroEscena>
  );
}
