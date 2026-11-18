import { BotonSumar } from "@/components/BotonSumar";
import { Revelar } from "@/components/motion/Revelar";
import type { Promo } from "@/lib/planilla/tipos";
import { cn, formatoPrecio } from "@/lib/utils";

/** Los combos vienen de la planilla. Sin combos disponibles, la sección no se muestra. */
export function Combos({ promos }: { promos: Promo[] }) {
  if (promos.length === 0) return null;
  const destacada = promos.find((p) => p.destacada) ?? promos[0];
  const resto = promos.filter((p) => p !== destacada);

  return (
    <section id="combos" aria-labelledby="titulo-combos" className="relative bg-carbon pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8">
        <h2 id="titulo-combos" className="max-w-[12ch] text-[clamp(48px,7vw,88px)] text-hueso">
          Combos y promos
        </h2>

        <Revelar escalon={0.14} className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-12 md:gap-6">
          {/* Destacada: la única en brasa, texto carbón */}
          <article
            data-revelar
            className="flex min-h-[420px] flex-col justify-between gap-10 rounded-medio bg-brasa p-7 text-carbon md:col-span-7 md:row-span-2 md:p-10"
          >
            <div>
              {destacada.sinStock && <EtiquetaSinStock className="mb-4 border-carbon text-carbon" />}
              <h3 className="text-[clamp(52px,6.4vw,96px)]">{destacada.titulo}</h3>
              <p className="mt-4 max-w-[36ch] text-[18px] font-medium">{destacada.detalle}</p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <p className="font-display text-[56px] leading-none md:text-[64px]">{formatoPrecio(destacada.precio)}</p>
              <BotonSumar id={`combo:${destacada.titulo}`} tipo="combo" nombre={destacada.titulo} precio={destacada.precio} tono="brasa" sinStock={destacada.sinStock} />
            </div>
          </article>

          {resto.map((p, i) => (
            <article
              key={p.titulo + i}
              data-revelar
              className={cn(
                "flex flex-col justify-between gap-8 rounded-medio border border-masa/12 bg-hollin p-7 md:col-span-5 md:p-8",
              )}
            >
              <div>
                {p.sinStock && <EtiquetaSinStock className="mb-3 border-masa/60 text-masa" />}
                <h3 className="text-[34px] text-hueso md:text-[40px]">{p.titulo}</h3>
                <p className="mt-3 text-[16px] text-apagado-oscuro">{p.detalle}</p>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <p className="font-display text-[44px] leading-none text-masa">{formatoPrecio(p.precio)}</p>
                <BotonSumar id={`combo:${p.titulo}`} tipo="combo" nombre={p.titulo} precio={p.precio} tono="oscuro" sinStock={p.sinStock} />
              </div>
            </article>
          ))}
        </Revelar>
      </div>
    </section>
  );
}

function EtiquetaSinStock({ className }: { className?: string }) {
  return (
    <span className={cn("etiqueta inline-block rounded-full border-2 px-3 py-0.5 text-[12px]", className)}>Sin stock</span>
  );
}
