"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

/** Link ancla que scrollea con Lenis (o nativo si está desactivado). */
export function NavLink({ href = "#", onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { scrollTo } = useSmoothScroll();
  return (
    <a
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (!href.startsWith("#") || e.defaultPrevented) return;
        e.preventDefault();
        scrollTo(href);
        history.replaceState(null, "", href);
      }}
      {...props}
    />
  );
}
