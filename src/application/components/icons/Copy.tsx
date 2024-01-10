import clsx from "clsx";
import { Icon, IconProps } from "../Icon";

interface CopyIconProps {
  className?: string;
  size?: IconProps["size"];
}
export function CopyIcon({ className, size }: CopyIconProps) {
  return (
    <Icon
      viewBox="0 0 24 24"
      size={size}
      className={clsx(className, "fill-none")}
    >
      <g clipPath="url(#clip0_95_2786)">
        <path
          d="M16.4531 4.96875V2.39062C16.4531 2.14198 16.3544 1.90353 16.1785 1.72771C16.0027 1.5519 15.7643 1.45312 15.5156 1.45312H2.39062C2.14198 1.45312 1.90353 1.5519 1.72771 1.72771C1.5519 1.90353 1.45313 2.14198 1.45312 2.39062V15.5156C1.45312 15.7643 1.5519 16.0027 1.72771 16.1785C1.90353 16.3544 2.14198 16.4531 2.39062 16.4531H4.96875M7.54688 8.48438C7.54688 8.23573 7.64565 7.99728 7.82146 7.82146C7.99728 7.64565 8.23573 7.54688 8.48438 7.54688H21.6094C21.858 7.54688 22.0965 7.64565 22.2723 7.82146C22.4481 7.99728 22.5469 8.23573 22.5469 8.48438V21.6094C22.5469 21.858 22.4481 22.0965 22.2723 22.2723C22.0965 22.4481 21.858 22.5469 21.6094 22.5469H8.48438C8.23573 22.5469 7.99728 22.4481 7.82146 22.2723C7.64565 22.0965 7.54688 21.858 7.54688 21.6094V8.48438Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_95_2786">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}
