// Datos estructurados para Google (schema.org Restaurant). Los horarios salen de la planilla,
// por eso el <script> lo arma la página (que lee la planilla) y no el layout.
import { site, instagramUrl } from "@/content/site";
import type { HorarioSemanal } from "@/lib/planilla/tipos";

export const descripcionSitio = `${site.bajada} en ${site.ciudad}. ${site.direccion}. Pedí por WhatsApp.`;

const dias = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function jsonLdRestaurante(semanal: HorarioSemanal) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.nombre,
    description: descripcionSitio,
    url: site.url,
    image: `${site.url}/opengraph-image.png`,
    telephone: site.telefono,
    servesCuisine: ["Pizza", "Pizza estilo New York"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.direccion,
      addressLocality: site.ciudad,
      addressRegion: site.provincia,
      postalCode: site.codigoPostal,
      addressCountry: "AR",
    },
    sameAs: [instagramUrl],
    openingHoursSpecification: Object.entries(semanal).flatMap(([dia, turnos]) =>
      turnos.map((t) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dias[Number(dia)]}`,
        opens: t.abre,
        closes: t.cierra,
      })),
    ),
  };
}
