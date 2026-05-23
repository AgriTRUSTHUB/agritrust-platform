import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GradientHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
}

const GRADIENT_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg, #C8A951 0%, #97BC62 42%, #2C5F2D 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

/**
 * Renders a heading with the AgriTRUST three-colour brand gradient
 * (gold #C8A951 → sage #97BC62 → forest #2C5F2D) applied via CSS background-clip.
 *
 * Usage:
 *   <GradientHeading>Marketplace</GradientHeading>
 *   <GradientHeading as="h2" className="text-2xl">Section title</GradientHeading>
 *
 * The default element is <h1> with the standard platform heading style
 * (text-3xl font-serif font-bold tracking-tight). Pass `className` to override.
 */
export function GradientHeading({
  as: Tag = "h1",
  className,
  children,
  style,
  ...props
}: GradientHeadingProps) {
  return (
    <Tag
      className={cn("text-3xl font-serif font-bold tracking-tight", className)}
      style={{ ...GRADIENT_STYLE, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
