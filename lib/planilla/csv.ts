// CSV mínimo (RFC 4180): comillas, comillas dobles escapadas y saltos de línea dentro de celdas.
// Módulo puro: sin imports (lo cargan los tests con node --test).

export function parseCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let comillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          celda += '"';
          i++;
        } else comillas = false;
      } else celda += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") {
      fila.push(celda);
      celda = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else celda += c;
  }
  if (celda !== "" || fila.length > 0) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas;
}

/** "  Descripción " → "descripcion". */
export const normalizarClave = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Filas como objetos con las claves del encabezado normalizadas. Descarta filas sin ningún dato. */
export function filasConEncabezado(texto: string): Record<string, string>[] {
  const [encabezado, ...resto] = parseCsv(texto);
  if (!encabezado) return [];
  const claves = encabezado.map(normalizarClave);
  return resto
    .filter((f) => f.some((c) => c.trim() !== ""))
    .map((f) => Object.fromEntries(claves.map((k, i) => [k, (f[i] ?? "").trim()])));
}
