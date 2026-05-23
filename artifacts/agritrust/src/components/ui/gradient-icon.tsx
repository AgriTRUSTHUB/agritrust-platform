import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

interface GradientIconProps {
  icon: ComponentType<LucideProps>;
  active?: boolean;
  size?: number;
}

/**
 * Renders a Lucide icon with the AgriTRUST brand gradient applied via SVG stroke.
 * Requires <AgritrustGradientDefs /> to be rendered once in the same HTML document
 * (the sidebar `<aside>` satisfies this; inline SVG defs are document-scoped in browsers).
 */
export function GradientIcon({ icon: Icon, active = false, size = 22 }: GradientIconProps) {
  return (
    <Icon
      width={size}
      height={size}
      className="shrink-0"
      style={{
        stroke: "url(#agritrust-nav-gradient)",
        fill: "none",
        opacity: active ? 1 : 0.68,
        transition: "opacity 150ms ease",
      }}
    />
  );
}

/**
 * Inject this once into the sidebar DOM. The <linearGradient> is then available
 * document-wide for any `url(#agritrust-nav-gradient)` SVG stroke reference.
 */
export function AgritrustGradientDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}
    >
      <defs>
        {/*
          gradientUnits="objectBoundingBox": the gradient spans 0→1 across each
          referencing element's own bounding box, so every icon gets the full sweep
          regardless of its position on the page.
          Direction: top-left → bottom-right (135° diagonal).
        */}
        <linearGradient
          id="agritrust-nav-gradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#C8A951" />   {/* gold    */}
          <stop offset="42%"  stopColor="#97BC62" />   {/* sage    */}
          <stop offset="100%" stopColor="#2C5F2D" />   {/* forest  */}
        </linearGradient>
      </defs>
    </svg>
  );
}
