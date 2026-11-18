import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Cinta } from "@/components/sections/Cinta";
import { Menu } from "@/components/sections/Menu";
import { Combos } from "@/components/sections/Combos";
import { MarquesinaFotos } from "@/components/sections/MarquesinaFotos";
import { Historia } from "@/components/sections/Historia";
import { Horarios } from "@/components/sections/Horarios";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppFijo } from "@/components/WhatsAppFijo";
import { PedidoPanel } from "@/components/PedidoPanel";
import { Cursor } from "@/components/Cursor";
import { HorarioProvider } from "@/components/providers/HorarioProvider";
import { SincronizarPedido } from "@/components/SincronizarPedido";
import { obtenerDatos } from "@/lib/planilla";
import { jsonLdRestaurante } from "@/lib/json-ld";
import { diasQueAbre } from "@/lib/horario";

/** Porciones, combos y horarios salen de la planilla de Google (lib/planilla), con caché de 5 minutos. */
export default async function Home() {
  const { porciones, promos, horario } = await obtenerDatos();
  const dias = diasQueAbre(horario.semanal);
  const catalogo = [
    ...porciones.map((p) => ({ id: `porcion:${p.nombre}`, precio: p.precio, sinStock: p.sinStock })),
    ...promos.map((p) => ({ id: `combo:${p.titulo}`, precio: p.precio, sinStock: p.sinStock })),
  ];

  return (
    <HorarioProvider horario={horario}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRestaurante(horario.semanal)).replace(/</g, "\\u003c") }}
      />
      <a
        href="#menu"
        className="sr-only z-50 rounded-full bg-mostaza px-5 py-3 font-bold text-carbon focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al menú
      </a>
      <Nav hayCombos={promos.length > 0} />
      {/* El contenido va por encima del footer (que está fijo debajo): al terminar, sube como un telón */}
      <main className="relative z-10 bg-carbon">
        <Hero dias={dias} />
        <Cinta dias={dias} />
        <Menu porciones={porciones} />
        <Combos promos={promos} />
        <MarquesinaFotos />
        <Historia />
        <Horarios />
        <div data-fin-contenido aria-hidden className="h-px" />
      </main>
      <Footer />
      <WhatsAppFijo />
      <PedidoPanel />
      <Cursor />
      <SincronizarPedido catalogo={catalogo} />
    </HorarioProvider>
  );
}
