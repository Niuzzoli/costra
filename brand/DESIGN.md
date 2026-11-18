# Costra Pizza — DESIGN.md

Pizza tipo New York por porciones, Cipolletti. Dirección: pizzería de noche con humor. Oscura y cálida por defecto, porción como héroe, titulares enormes en mayúsculas, mascota (el gato).
Fuente de la dirección: perfil de Instagram @costra.pizza, revisado el 17/11/2026. No se compararon otros sitios.

## Color (rol por token)
| Token | Valor | Uso |
|---|---|---|
| carbon | #120E0B | Fondo principal (≈55% de la pantalla) |
| hollin | #1F1813 | Tarjetas y paneles sobre carbón |
| brasa | #F0561D | Botón primario, palabra destacada de un título. Texto encima: carbón |
| brasa-oscura | #C23A0A | Links y precios sobre fondos claros |
| mostaza | #F5B82E | Stickers, cintas, hover, anillo de foco |
| albahaca | #1E5A32 | Etiquetas (vegetariana), estados OK. Texto encima: hueso |
| masa | #F3E8D3 | Texto sobre carbón, fondos de menú |
| hueso | #FBF6EC | Fondo claro, titulares sobre carbón |

Contrastes: carbón/brasa 5.54, masa/carbón 15.8, mostaza/carbón 10.8, brasa-oscura/hueso 4.99, hueso/albahaca 7.6. Hueso sobre brasa 3.22: solo texto de 24px o más.
Un acento por bloque. Los colores de colaboraciones (Ritual, Pizza Break) quedan fuera del sistema.

## Tipografía
- Display: Anton 400, mayúsculas, interlineado 0.95. H1 72–230px, H2 40–72px, H3 24–32px.
- Texto: DM Sans 400/500/700, 17px/1.55, líneas de 60–70 caracteres. Etiquetas 13px, 700, +14%.
- Archivos en `fuentes/` (licencia OFL).

## Forma y espacio
Radios 6px, 14px y píldora. Espacio 4·8·16·24·40·64·88. Contenido 1120px. Sin sombras: se separa con color y borde fino.

## Componentes
- Botón primario: píldora, fondo brasa, texto carbón 700, hover mostaza, foco anillo mostaza 3px.
- Secundario: borde masa, hover relleno masa. Quieto: texto mostaza con subrayado.
- Sticker: Anton, rotación −3° a +2°, máximo 2 por pantalla.
- Tarjeta de porción: fondo masa, foto arriba, nombre en Anton, precio en brasa-oscura.
- Campos: fondo carbón, borde masa 30%, foco mostaza.

## Logo
Gato negro de ojos entrecerrados (archivo original del cliente). Usar los SVG de `logo/svg/`: negro sobre claro, masa sobre carbón. No redibujar, no deformar, no agregar sombras. Espacio libre mínimo: 25% del ancho. Tamaño mínimo 32px.
Aviso: el SVG es una vectorización automática de un JPG de 150×150 px, y los ojos quedaron simplificados. Para impresión o gran formato usar el archivo vectorial original.

## Imagen y voz
Fotos: porción sola sobre plato, fondo oscuro, luz cálida, gente real. Ilustración de campaña solo en campañas. Tono: voseo, frases cortas, humor liviano; precio y horario siempre claros.

## No hacer
Degradés violeta/azul, vidrio esmerilado, hueso sobre brasa en texto chico, mezclar la paleta con la de colaboraciones, redibujar el logo.
