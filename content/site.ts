// Datos del local. Editá acá y se actualiza toda la web (incluido el JSON-LD para Google).

export const site = {
  nombre: "Costra Pizza",
  bajada: "Pizza tipo New York por porciones",
  ciudad: "Cipolletti",
  provincia: "Río Negro",
  direccion: "25 de Mayo 148",
  codigoPostal: "8324",
  // TODO: reemplazar por el dominio final cuando esté publicado.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://costra-pizza.vercel.app",
  telefono: "+54 299 464 1261",
  whatsapp: "542994641261",
  instagram: "costra.pizza",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Costra Pizza, 25 de Mayo 148, Cipolletti, Río Negro"),
  // Mapa embebido en "Cuándo y dónde" (no necesita API key).
  mapsEmbed:
    "https://www.google.com/maps?output=embed&z=16&q=" +
    encodeURIComponent("Costra Pizza, 25 de Mayo 148, Cipolletti, Río Negro"),
  zonaHoraria: "America/Argentina/Buenos_Aires",
  // TODO: confirmar con el local. Si toman pedidos por WhatsApp fuera de horario para retirar
  // cuando abren, poné true: los botones dicen "Encargar" y el mensaje lo pide como encargo.
  // Con false, la web no promete nada: avisa que está cerrado y que responden al abrir.
  aceptaEncargos: false,
} as const;

/** Mensajes prellenados de WhatsApp. */
export const mensajes = {
  general: "¡Hola Costra! Quiero hacer un pedido.",
  /** Nota que se agrega con el local cerrado. */
  notaFueraDeHorario: site.aceptaEncargos
    ? "Ya sé que ahora están cerrados: es para encargar cuando abran."
    : "(Les escribo fuera de horario, respondan cuando abran.)",
  /** Con el local cerrado se agrega la nota al mensaje (en un renglón aparte si el mensaje tiene varios). */
  fueraDeHorario: (mensaje: string) =>
    mensaje.includes("\n") ? `${mensaje}\n\n${mensajes.notaFueraDeHorario}` : `${mensaje} ${mensajes.notaFueraDeHorario}`,
};

/** Textos de los botones grandes según el estado del local. */
export const textosCta = {
  abierto: "Pedir por WhatsApp",
  cerrado: site.aceptaEncargos ? "Encargar por WhatsApp" : "Escribinos por WhatsApp",
  aviso: (detalle: string) =>
    site.aceptaEncargos
      ? `Cerrado ahora · ${detalle}. Te lo dejamos encargado.`
      : `Cerrado ahora · ${detalle}. Escribinos y te respondemos al abrir.`,
};

export function linkWhatsApp(mensaje: string = mensajes.general) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export const instagramUrl = `https://www.instagram.com/${site.instagram}/`;
