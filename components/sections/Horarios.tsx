import { MapPin, ArrowUpRight, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { Revelar } from "@/components/motion/Revelar";
import { EstadoAbierto } from "@/components/EstadoAbierto";
import { ListaHorarios } from "@/components/ListaHorarios";
import { site, instagramUrl } from "@/content/site";

export function Horarios() {
  return (
    <section id="horarios" aria-labelledby="titulo-horarios" className="relative bg-carbon pb-24 md:pb-36">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-16 px-4 md:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h2 id="titulo-horarios" className="mb-10 text-[clamp(48px,7vw,88px)] text-hueso">
            Cuándo y dónde
          </h2>
          <EstadoAbierto />
          <ListaHorarios />
        </div>

        <Revelar className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7 lg:pt-28">
          {/* Mapa de Google (sin API key). Carga diferida: solo se pide cuando se acerca a la pantalla.
              El filtro lo lleva a la paleta oscura y cálida de la marca; con el mouse encima se ve en colores reales. */}
          <div
            data-revelar
            className="group relative aspect-[4/3] overflow-hidden rounded-medio border border-masa/12 bg-hollin lg:aspect-[5/4]"
          >
            <iframe
              src={site.mapsEmbed}
              title={`Mapa: Costra Pizza en ${site.direccion}, ${site.ciudad}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 transition-[filter] duration-500 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.55)_sepia(0.2)_brightness(0.95)] group-hover:[filter:none]"
            />
          </div>

          <address data-revelar className="not-italic">
            <p className="flex items-start gap-3 font-display text-[clamp(36px,4vw,52px)] leading-[0.95] text-hueso uppercase">
              <MapPin size={36} weight="bold" className="mt-0.5 shrink-0 text-mostaza" aria-hidden />
              <span>
                {site.direccion}
                <span className="block text-apagado-oscuro">{site.ciudad}</span>
              </span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="boton"
                className="btn btn-secundario"
              >
                Cómo llegar
                <ArrowUpRight size={18} weight="bold" aria-hidden />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="boton"
                className="link-quieto inline-flex min-h-11 items-center gap-2"
              >
                <InstagramLogo size={20} weight="bold" aria-hidden />@{site.instagram}
              </a>
            </div>
          </address>
        </Revelar>
      </div>
    </section>
  );
}
