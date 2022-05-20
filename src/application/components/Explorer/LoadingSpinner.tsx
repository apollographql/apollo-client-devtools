/** @jsx jsx */
import React from "react";
import { jsx, keyframes } from "@emotion/core";

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

    const SPIN = keyframes`
    0% { transform: rotate(0) }
    100% { transform: rotate(360deg) }
  `;

    const SIZE_MAP: Record<Size, number> = {
      large: 90,
      medium: 64,
      small: 48,
      xsmall: 32,
      "2xsmall": 16,
    };

    const colors = {
      orbitColor: "#EBEEF0",
      orbitOpacity: 1,
      asteroidColor: "#2070CB",
    };

    const { orbitColor, orbitOpacity, asteroidColor } = colors;

    const pixelSize = SIZE_MAP[size];

    const mountTime = React.useRef(Date.now());
    const mountDelay = -(mountTime.current % DURATION);

    return (
      <svg
        ref={ref}
        role="progressbar"
        viewBox="0 0 100 100"
        css={{
          width: pixelSize,
          height: pixelSize,
        }}
        {...props}
      >
        <circle
          strokeWidth="8"
          stroke={orbitColor}
          strokeOpacity={orbitOpacity}
          fill="transparent"
          r="41"
          cx="50"
          cy="50"
        />
        <g transform="translate(50 50)">
          <circle
            css={{
              animation: `${SPIN} ${DURATION}ms linear infinite`,
              willChange: "transform",
              animationDelay: `${mountDelay}ms`,
            }}
            fill={asteroidColor}
            r="10"
            cx="40"
            cy="0"
          />
        </g>
      </svg>
    );
  }
);
