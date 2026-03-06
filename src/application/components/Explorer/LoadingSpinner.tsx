import React from "react";

export type Size = "large" | "medium" | "small" | "xsmall" | "2xsmall";
export type Theme = "light" | "dark" | "grayscale";
interface Props {
  /**
   * Class name that will be applied to the svg
   */
  className?: string;

  /**
   * Theme for the spinner
   * @default "light"
   */
  theme?: Theme;

  /**
   * Size of the spinner
   * @default "medium"
   */
  size?: Size;
}

export const LoadingSpinner = React.forwardRef<SVGSVGElement, Props>(
  ({ size = "medium", ...props }, ref) => {
    /* Length of animation */
    const DURATION = 1000;

    const SIZE_MAP: Record<Size, number> = {
      large: 90,
      medium: 64,
      small: 48,
      xsmall: 32,
      "2xsmall": 16,
    };

    const pixelSize = SIZE_MAP[size];
    const [mountTime] = React.useState(() => Date.now());
    const mountDelay = -(mountTime % DURATION);

    return (
      <svg
        ref={ref}
        role="progressbar"
        viewBox="0 0 100 100"
        style={{ width: pixelSize, height: pixelSize }}
        {...props}
      >
        <circle
          strokeWidth="8"
          className="stroke-silver-500 dark:stroke-navy-400/60"
          fill="transparent"
          r="41"
          cx="50"
          cy="50"
        />
        <g transform="translate(50 50)">
          <circle
            className="animate-spin will-change-transform fill-brand-nebula dark:fill-brand-nebula-dark"
            style={{ animationDelay: `${mountDelay}ms` }}
            r="10"
            cx="40"
            cy="0"
          />
        </g>
      </svg>
    );
  }
);
