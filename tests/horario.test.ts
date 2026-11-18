import { test } from "node:test";
import assert from "node:assert/strict";
import { estadoActual, agruparHorarios, avisoVigente, turnosDe, diasQueAbre } from "../lib/horario.ts";
import type { Horario, HorarioSemanal } from "../lib/planilla/tipos.ts";

const dos = [
  { abre: "11:45", cierra: "16:30" },
  { abre: "20:00", cierra: "23:45" },
];
const estandar: HorarioSemanal = { 0: dos, 1: [], 2: dos, 3: dos, 4: dos, 5: dos, 6: dos };
const h = (semanal: HorarioSemanal, especiales: Horario["especiales"] = []): Horario => ({ semanal, especiales });
/** Fechas en hora de Argentina. 2026-11-16 es lunes, 17 martes, 22 domingo. */
const ar = (s: string) => new Date(`${s}:00-03:00`);

test("semanal estándar", () => {
  assert.deepEqual(estadoActual(h(estandar), ar("2026-11-17T12:00")), { abierto: true, detalle: "Cierra en 4 h 30 min" });
  assert.deepEqual(estadoActual(h(estandar), ar("2026-11-17T17:00")), { abierto: false, detalle: "Abrimos hoy a las 20:00" });
  assert.deepEqual(estadoActual(h(estandar), ar("2026-11-16T12:00")), { abierto: false, detalle: "Abrimos mañana a las 11:45" });
  assert.deepEqual(estadoActual(h(estandar), ar("2026-11-22T23:50")), { abierto: false, detalle: "Abrimos el martes a las 11:45" });
});

test("turno que cruza la medianoche", () => {
  const noche: HorarioSemanal = { ...estandar, 2: [{ abre: "20:00", cierra: "01:00" }], 3: [] };
  assert.deepEqual(estadoActual(h(noche), ar("2026-11-18T00:30")), { abierto: true, detalle: "Cierra en 30 min" });
  assert.deepEqual(estadoActual(h(noche), ar("2026-11-17T23:00")), { abierto: true, detalle: "Cierra en 2 h" });
  assert.deepEqual(estadoActual(h(noche), ar("2026-11-18T01:30")), { abierto: false, detalle: "Abrimos mañana a las 11:45" });
});

test("vacaciones: cerrado con aviso y próxima apertura después", () => {
  const vac = h(estandar, [{ desde: "2026-11-17", hasta: "2026-11-20", turnos: [], aviso: "Vacaciones" }]);
  assert.deepEqual(estadoActual(vac, ar("2026-11-17T12:00")), { abierto: false, detalle: "Abrimos el sábado a las 11:45", aviso: "Vacaciones" });
  assert.deepEqual(turnosDe(vac, "2026-11-21", 6).turnos, dos);
});

test("día especial con otro horario", () => {
  const esp = h(estandar, [{ desde: "2026-11-17", hasta: "2026-11-17", turnos: [{ abre: "18:00", cierra: "22:00" }], aviso: "" }]);
  assert.deepEqual(estadoActual(esp, ar("2026-11-17T12:00")), { abierto: false, detalle: "Abrimos hoy a las 18:00" });
  assert.equal(estadoActual(esp, ar("2026-11-17T19:00")).abierto, true);
});

test("avisoVigente", () => {
  const con = (desde: string, hasta: string) => h(estandar, [{ desde, hasta, turnos: [], aviso: "Feriado" }]);
  const hoy = ar("2026-11-17T12:00");
  assert.equal(avisoVigente(con("2026-11-22", "2026-11-22"), hoy), "Feriado");
  assert.equal(avisoVigente(con("2026-11-26", "2026-11-26"), hoy), null);
  assert.equal(avisoVigente(con("2026-11-10", "2026-11-16"), hoy), null);
  assert.equal(avisoVigente(con("2026-11-10", "2026-11-17"), hoy), "Feriado");
});

test("agruparHorarios", () => {
  assert.deepEqual(agruparHorarios(estandar), [
    { dias: "Martes a domingo", turnos: ["11:45 a 16:30", "20:00 a 23:45"], diasNum: [2, 3, 4, 5, 6, 0] },
    { dias: "Lunes", turnos: ["Cerrado"], diasNum: [1] },
  ]);
  const t = [{ abre: "09:00", cierra: "18:00" }];
  assert.deepEqual(
    agruparHorarios({ 0: [], 1: t, 2: t, 3: t, 4: t, 5: t, 6: [] }).map((g) => g.dias),
    ["Lunes a viernes", "Sábado y domingo"],
  );
  assert.deepEqual(
    agruparHorarios({ 0: [], 1: t, 2: [], 3: t, 4: [], 5: [], 6: [] }).map((g) => g.dias),
    ["Lunes", "Martes", "Miércoles", "Jueves a domingo"],
  );
});

test("diasQueAbre", () => {
  const t = [{ abre: "09:00", cierra: "18:00" }];
  const otro = [{ abre: "20:00", cierra: "23:00" }];
  assert.equal(diasQueAbre(estandar), "Martes a domingo");
  assert.equal(diasQueAbre({ 0: t, 1: t, 2: t, 3: t, 4: t, 5: t, 6: t }), "Todos los días");
  assert.equal(diasQueAbre({ 0: [], 1: t, 2: t, 3: t, 4: t, 5: otro, 6: [] }), "Lunes a viernes");
  assert.equal(diasQueAbre({ 0: t, 1: t, 2: [], 3: t, 4: [], 5: [], 6: [] }), "Domingo, lunes y miércoles");
  assert.equal(diasQueAbre({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: t, 6: t }), "Viernes y sábado");
  assert.equal(diasQueAbre({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }), null);
});
