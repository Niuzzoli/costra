import { MenuRuleta } from "@/components/MenuRuleta";
import type { Porcion } from "@/lib/planilla/tipos";
import { formatoPrecio } from "@/lib/utils";

/** Las porciones vienen de la planilla (solo las disponibles, en el orden de las filas). */
export function Menu({ porciones }: { porciones: Porcion[] }) {
  return (
    <section
      id="menu"
      aria-labelledby="titulo-menu"
      data-cursor-tema="claro"
      className="relative bg-masa pt-24 text-carbon md:pt-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-8">
        <h2 id="titulo-menu" className="text-[clamp(48px,7vw,88px)] text-carbon">
          Porción por porción
        </h2>
      </div>

      {/* Lista completa para lectores de pantalla (la ruleta visual muestra una porción a la vez) */}
      <ul className="sr-only">
        {porciones.map((p, i) => (
          <li key={p.nombre + i}>
            {p.nombre}
            {p.vegetariana ? " (vegetariana)" : ""}: {p.descripcion} {formatoPrecio(p.precio)} la porción.
            {p.sinStock ? " Hoy sin stock." : ""}
          </li>
        ))}
      </ul>

      {porciones.length > 0 ? (
        <MenuRuleta porciones={porciones} />
      ) : (
        <p className="mx-auto max-w-[1280px] px-4 pt-8 pb-24 text-[20px] text-apagado-claro md:px-8 md:pb-32">
          Hoy no hay porciones cargadas, consultanos por WhatsApp.
        </p>
      )}
    </section>
  );
}
