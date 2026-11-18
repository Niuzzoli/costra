import { InstagramLogo, WhatsappLogo, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Gato } from "@/components/Gato";
import { CtaWhatsApp } from "@/components/CtaWhatsApp";
import { PieEscena } from "@/components/motion/PieEscena";
import { site, instagramUrl } from "@/content/site";

const enlace =
  "inline-flex min-h-11 items-center gap-2.5 font-bold underline decoration-carbon/30 decoration-2 underline-offset-4 transition-[text-decoration-color] hover:decoration-carbon";

const lineas = ["Pedí tu", "porción"];

/**
 * Cierre de la página: "Pedí tu porción" + los datos del footer, sobre brasa (texto carbón).
 * Está fijo debajo de <main> (sticky bottom-0, z-0): la página sube como un telón y lo descubre.
 * Tiene que entrar en una pantalla de alto para que se vea completo; por eso el titular tope en 150px.
 */
export function Footer() {
  return (
    <footer
      id="pedido"
      aria-labelledby="titulo-pedido"
      className="sticky bottom-0 z-0 bg-brasa pt-20 pb-28 text-carbon md:pt-24 lg:pb-12"
    >
      <PieEscena>
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          {/* Interlineado 1.12 (no 0.95): la tilde de la Ó en mayúscula chocaba con la U de arriba */}
          <h2 id="titulo-pedido" aria-label="Pedí tu porción" className="text-[clamp(64px,11vw,150px)] leading-[1.12]">
            {lineas.map((linea) => (
              // Cada línea recorta sus letras, con aire arriba para que no se corten las tildes
              <span key={linea} aria-hidden className="-mt-[0.25em] block overflow-hidden pt-[0.25em]">
                {Array.from(linea).map((letra, i) => (
                  <span key={i} data-pie-letra className="inline-block whitespace-pre">
                    {letra}
                  </span>
                ))}
              </span>
            ))}
          </h2>

          <div className="mt-14 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              {/* Gato negro sobre brasa, como en la guía de marca */}
              <span data-pie-gato className="inline-block">
                <Gato color="carbon" size={72} className="size-[56px] md:size-[72px]" />
              </span>
              <p data-pie-dato className="font-display text-[clamp(56px,7vw,88px)] leading-[0.82] uppercase" aria-hidden>
                Costra
              </p>
            </div>

            <ul className="grid gap-1 text-[17px]">
              <li data-pie-dato>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" data-cursor="boton" className={enlace}>
                  <MapPin size={20} weight="bold" aria-hidden />
                  {site.direccion}, {site.ciudad}
                </a>
              </li>
              <li data-pie-dato>
                <CtaWhatsApp className={enlace}>
                  <WhatsappLogo size={20} weight="bold" aria-hidden />
                  {site.telefono}
                </CtaWhatsApp>
              </li>
              <li data-pie-dato>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" data-cursor="boton" className={enlace}>
                  <InstagramLogo size={20} weight="bold" aria-hidden />@{site.instagram}
                </a>
              </li>
            </ul>
          </div>

          <p data-pie-dato className="mt-12 border-t-2 border-carbon/20 pt-6 text-[14px] font-medium">
            © {site.nombre}. {site.bajada}, {site.ciudad}, {site.provincia}.
          </p>
        </div>
      </PieEscena>
    </footer>
  );
}
