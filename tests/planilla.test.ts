import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, filasConEncabezado } from "../lib/planilla/csv.ts";
import {
  parsePrecio,
  parseCheck,
  parseHora,
  parseFecha,
  normalizarFoto,
  parsePorciones,
  parsePromos,
  parseHorarioSemanal,
  parseFechasEspeciales,
} from "../lib/planilla/parsear.ts";

test("parseCsv: comas, comillas y saltos de línea dentro de celdas", () => {
  assert.deepEqual(parseCsv('a,"b, c","d ""e"""\n1,"x\ny",3'), [
    ["a", "b, c", 'd "e"'],
    ["1", "x\ny", "3"],
  ]);
});

test("parseCsv: CRLF y salto final", () => {
  assert.deepEqual(parseCsv("a,b\r\n1,2\r\n"), [
    ["a", "b"],
    ["1", "2"],
  ]);
});

test("filasConEncabezado: normaliza encabezados y descarta filas vacías", () => {
  assert.deepEqual(filasConEncabezado('" Descripción ",PRECIO\nhola,7000\n,\n'), [{ descripcion: "hola", precio: "7000" }]);
});

test("parsePrecio", () => {
  assert.equal(parsePrecio("7000"), 7000);
  assert.equal(parsePrecio("7.000"), 7000);
  assert.equal(parsePrecio("$ 7.000"), 7000);
  assert.equal(parsePrecio(""), null);
  assert.equal(parsePrecio("siete"), null);
});

test("parseCheck", () => {
  for (const s of ["TRUE", "true", "sí", "si", "x"]) assert.equal(parseCheck(s), true, s);
  for (const s of ["FALSE", ""]) assert.equal(parseCheck(s), false, s);
});

test("parseHora", () => {
  assert.equal(parseHora("9:05"), "09:05");
  assert.equal(parseHora("20:00"), "20:00");
  assert.equal(parseHora("24:00"), null);
  assert.equal(parseHora("20"), null);
  assert.equal(parseHora("20:00:00"), "20:00");
  assert.equal(parseHora("8:30 p. m."), "20:30");
});

test("parseFecha", () => {
  assert.equal(parseFecha("1/2/2027"), "2027-02-01");
  assert.equal(parseFecha("31/02/2027"), null);
});

test("normalizarFoto", () => {
  const drive = "https://lh3.googleusercontent.com/d/ABC_1-x";
  assert.equal(normalizarFoto("https://drive.google.com/file/d/ABC_1-x/view?usp=sharing"), drive);
  assert.equal(normalizarFoto("https://drive.google.com/open?id=ABC_1-x"), drive);
  assert.equal(normalizarFoto("https://drive.google.com/uc?id=ABC_1-x&export=view"), drive);
  for (const s of ["/pizzas/pomo.png", "pizzas/pomo.png", "public/pizzas/pomo.png"]) assert.equal(normalizarFoto(s), "/pizzas/pomo.png", s);
  assert.equal(normalizarFoto(""), null);
  assert.equal(normalizarFoto("hola"), null);
});

test("parsePorciones", () => {
  const r = parsePorciones([
    { disponible: "TRUE", nombre: "Cheese", descripcion: "Queso", precio: "7000", veggie: "TRUE", foto: "/pizzas/cheese.png" },
    { disponible: "FALSE", nombre: "Apagada", descripcion: "", precio: "1", veggie: "", foto: "" },
    { disponible: "TRUE", nombre: "", descripcion: "sin nombre", precio: "1", veggie: "", foto: "" },
    { disponible: "TRUE", nombre: "Rara", descripcion: "x", precio: "mucho", veggie: "", foto: "cualquiera" },
  ]);
  assert.deepEqual(r, [
    { nombre: "Cheese", descripcion: "Queso", precio: 7000, foto: "/pizzas/cheese.png", vegetariana: true, sinStock: false },
    { nombre: "Rara", descripcion: "x", precio: null, foto: "/pizzas/cheese.png", vegetariana: false, sinStock: false },
  ]);
});

test("parsePromos", () => {
  assert.deepEqual(
    parsePromos([
      { disponible: "TRUE", nombre: "Combo", detalle: "Porción + bebida", precio: "15000", destacado: "TRUE" },
      { disponible: "FALSE", nombre: "Viejo", detalle: "", precio: "1", destacado: "" },
    ]),
    [{ titulo: "Combo", detalle: "Porción + bebida", precio: 15000, destacada: true, sinStock: false }],
  );
});

test("parseHorarioSemanal", () => {
  const r = parseHorarioSemanal([
    { dia: "Lunes", "abre 1": "", "cierra 1": "", "abre 2": "", "cierra 2": "" },
    { dia: "miércoles", "abre 1": "11:45", "cierra 1": "16:30", "abre 2": "20:00", "cierra 2": "" },
    { dia: "Sabado", "abre 1": "20:00", "cierra 1": "1:00", "abre 2": "", "cierra 2": "" },
  ]);
  assert.deepEqual(r, {
    0: [],
    1: [],
    2: [],
    3: [{ abre: "11:45", cierra: "16:30" }],
    4: [],
    5: [],
    6: [{ abre: "20:00", cierra: "01:00" }],
  });
  assert.equal(parseHorarioSemanal([{ dia: "Feriado", "abre 1": "10:00", "cierra 1": "12:00" }]), null);
});

test("parseFechasEspeciales", () => {
  assert.deepEqual(
    parseFechasEspeciales([
      { desde: "01/02/2027", hasta: "", "abre 1": "", "cierra 1": "", aviso: "Cerrado por feriado" },
      { desde: "10/02/2027", hasta: "12/02/2027", "abre 1": "18:00", "cierra 1": "22:00", aviso: "" },
      { desde: "mañana", hasta: "", aviso: "x" },
      { desde: "20/02/2027", hasta: "19/02/2027", aviso: "al revés" },
    ]),
    [
      { desde: "2027-02-01", hasta: "2027-02-01", turnos: [], aviso: "Cerrado por feriado" },
      { desde: "2027-02-10", hasta: "2027-02-12", turnos: [{ abre: "18:00", cierra: "22:00" }], aviso: "" },
    ],
  );
});

test("parsePorciones: Stock", () => {
  const base = { disponible: "TRUE", descripcion: "", precio: "7000", veggie: "", foto: "/pizzas/pomo.png" };
  const r = parsePorciones([
    { ...base, nombre: "Con stock", stock: "TRUE" },
    { ...base, nombre: "Agotada", stock: "FALSE" },
    { ...base, nombre: "Sin columna" },
    { ...base, nombre: "Vacía", stock: "" },
    { ...base, nombre: "Apagada", disponible: "FALSE", stock: "FALSE" },
  ]);
  assert.deepEqual(
    r.map((p) => [p.nombre, p.sinStock]),
    [
      ["Con stock", false],
      ["Agotada", true],
      ["Sin columna", false],
      ["Vacía", false],
    ],
  );
});

test("parsePromos: Stock", () => {
  const base = { disponible: "TRUE", detalle: "", precio: "15000", destacado: "" };
  assert.deepEqual(
    parsePromos([
      { ...base, nombre: "Con stock", stock: "TRUE" },
      { ...base, nombre: "Agotado", stock: "FALSE" },
      { ...base, nombre: "Sin columna" },
    ]).map((p) => [p.titulo, p.sinStock]),
    [
      ["Con stock", false],
      ["Agotado", true],
      ["Sin columna", false],
    ],
  );
});
