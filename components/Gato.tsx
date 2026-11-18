import Image from "next/image";
import { cn } from "@/lib/utils";

type Color = "masa" | "carbon" | "hueso" | "mostaza" | "brasa";

/**
 * Logo de Costra (el gato). Usa los SVG originales de brand/logo/svg sin modificar.
 * Reglas: tamaño mínimo 32px, espacio libre 25% del ancho, sin sombras ni deformaciones.
 * Masa sobre carbón, carbón sobre fondos claros.
 */
export function Gato({
  color = "masa",
  size = 48,
  className,
  decorativo = false,
}: {
  color?: Color;
  size?: number;
  className?: string;
  decorativo?: boolean;
}) {
  const lado = Math.max(32, size);
  return (
    <Image
      src={`/brand/costra-gato-${color}.svg`}
      alt={decorativo ? "" : "Costra Pizza"}
      width={lado}
      height={lado}
      unoptimized
      draggable={false}
      className={cn("pointer-events-none aspect-square select-none", className)}
    />
  );
}
