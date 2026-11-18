// Fotos del local y la gente (exportadas del Instagram de Costra, guardadas en /public/equipo).
// La marquesina usa `fotosMarquesina` en dos filas (mitad y mitad). Para sumar una foto, agregala acá
// con sus medidas reales (ancho y alto en px) y una descripción para el alt.

export type Foto = { src: string; ancho: number; alto: number; alt: string };

export const fotosMarquesina: Foto[] = [
  { src: "/equipo/igexport-DX1_FvLDoty.jpg", ancho: 1440, alto: 1920, alt: "Porción con burrata recién servida en su plato" },
  { src: "/equipo/igexport-DZLY7HCBNYD.jpg", ancho: 1440, alto: 1920, alt: "Clienta sonriendo con su porción en la mano" },
  { src: "/equipo/igexport-DYXxvSFRMTb.jpg", ancho: 1440, alto: 1694, alt: "Tres porciones distintas sobre la mesada de acero" },
  { src: "/equipo/igexport-DZu0ziVukul.jpg", ancho: 1170, alto: 1560, alt: "Porción y una lata de gaseosa sobre la mesa" },
  { src: "/equipo/igexport-DchZ3hauUWn.jpg", ancho: 3372, alto: 3372, alt: "Brindis con dos latas de cerveza junto a las porciones" },
  { src: "/equipo/igexport-DZ-4TeBhEfQ.jpg", ancho: 1170, alto: 1560, alt: "Rallando limón sobre una porción en la cocina" },
  { src: "/equipo/igexport-DbJsUETu-wU.jpg", ancho: 1440, alto: 1440, alt: "Clienta comiendo una porción directo de la caja" },
  { src: "/equipo/igexport-DZYT5JIhGXy.jpg", ancho: 1440, alto: 1920, alt: "Porción levantada frente a una camiseta de la selección argentina" },
  { src: "/equipo/igexport-DcCjNDGOaHl.jpg", ancho: 3072, alto: 4096, alt: "Porciones servidas, vistas desde arriba" },
];

/** Foto de la sección Nosotros. */
export const fotoNosotros: Foto & { sticker: string } = {
  src: "/equipo/igexport-DbWwGU6O5o2.jpg",
  ancho: 1440,
  alto: 1440,
  alt: "Pizzero de Costra con una pila de cajas, atendiendo el teléfono",
  // Chiste sobre la foto (el pizzero al teléfono). Cambialo o dejalo vacío ("") para sacarlo.
  sticker: "¿Me pasás tu pedido?",
};
