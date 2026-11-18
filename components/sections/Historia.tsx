import Image from "next/image";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import { FotoPegada } from "@/components/motion/FotoPegada";
import { historia } from "@/content/textos";
import { fotoNosotros } from "@/content/equipo";
import { site } from "@/content/site";

export function Historia() {
  return (
    <section id="nosotros" aria-labelledby="titulo-nosotros" className="relative bg-carbon pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 px-4 md:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h2 id="titulo-nosotros" className="text-[clamp(48px,7vw,88px)] text-hueso">
            Nosotros
          </h2>

          {/* React Bits ScrollReveal: cada palabra se "llena" de hueso al scrollear, pasando por brasa */}
          <ScrollReveal
            baseOpacity={0.6}
            enableBlur={false}
            baseRotation={0}
            highlightColor="var(--color-brasa)"
            wordAnimationEnd="center center"
            containerClassName="mt-8 md:mt-10"
            textClassName="max-w-[30ch] text-[clamp(26px,3vw,40px)] leading-[1.15] font-medium tracking-[-0.01em] text-hueso"
          >
            {historia}
          </ScrollReveal>
        </div>

        {/* La foto, como impresa y pegada: marco masa, epígrafe, y se endereza al scrollear */}
        <FotoPegada className="relative mx-auto w-full max-w-[460px] px-3 lg:col-span-5 lg:col-start-8 lg:max-w-none lg:px-0">
          <figure
            data-foto-marco
            data-cursor="foto"
            className="-rotate-2 rounded-chico bg-masa p-3 pb-0 will-change-transform md:p-4 md:pb-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-[3px] bg-hollin">
              <Image
                src={fotoNosotros.src}
                alt={fotoNosotros.alt}
                fill
                sizes="(min-width: 1024px) 460px, 90vw"
                className="object-cover"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-4 py-3 text-[14px] font-bold text-carbon md:py-4">
              <span>{site.ciudad}</span>
              <span className="text-apagado-claro">{site.direccion}</span>
            </figcaption>
          </figure>
          {fotoNosotros.sticker && (
            <p
              data-foto-sticker
              aria-hidden
              className="sticker absolute -top-5 -left-1 rotate-[-6deg] bg-mostaza text-[22px] text-carbon md:-top-6 md:-left-6 md:text-[28px]"
            >
              {fotoNosotros.sticker}
            </p>
          )}
        </FotoPegada>
      </div>
    </section>
  );
}
