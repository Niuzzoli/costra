export function cn(...clases: Array<string | false | null | undefined>) {
  return clases.filter(Boolean).join(" ");
}

export function formatoPrecio(precio: number | null) {
  // Precio vacío en la planilla: no inventamos un número.
  if (precio === null) return "Consultar";
  return "$ " + precio.toLocaleString("es-AR");
}
