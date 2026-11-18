// Textos de la web: cinta, historia y porción del hero.

/**
 * Frases de la cinta mostaza. DIAS_QUE_ABRE se reemplaza por los días de la planilla ("Martes a domingo")
 * y desaparece si no abre ningún día.
 */
export const DIAS_QUE_ABRE = "{dias}";
export const cinta = ["Pizza tipo New York", "Por porciones", "¿Dulce o birra?", DIAS_QUE_ABRE, "Cipolletti"];


/**
 * Texto grande que se llena palabra por palabra. TODO: reemplazar con la historia real.
 * Que no repita el hero ("masa fina, borde crocante..."): contá algo que no esté en el resto de la página,
 * por ejemplo quiénes la hacen, desde cuándo, el horno o por qué pizza tipo New York en Cipolletti.
 * Ideal: 2 o 3 frases, menos de 40 palabras.
 */
export const historia =
  "Acá va la historia de Costra en dos o tres frases: quiénes la hacen, desde cuándo y por qué eligieron la porción tipo New York para Cipolletti.";

/**
 * Hero: la porción que aparece por delante de "COSTRA".
 * Usá un PNG recortado con fondo transparente (en /public/pizzas hay varias: cheese, costra, especial, peperoni, pomo).
 */
export const heroPorcion = {
  foto: "/pizzas/costra.png",
  ancho: 1100,
  alto: 1429,
  alt: "Porción de pizza tipo New York de Costra, vista desde arriba",
};
