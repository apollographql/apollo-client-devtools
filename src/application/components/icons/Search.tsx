import { Icon, IconProps } from "../Icon";

interface SearchIconProps {
  className?: string;
  size?: IconProps["size"];
}

export function SearchIcon({ className, size }: SearchIconProps) {
  return (
    <Icon viewBox="0 0 24 24" className={className} size={size}>
      <g clipPath="url(#clip0_95_4026)">
        <path
          d="M15.9573 15.9563L22.5469 22.5469M2.13007 13.2722C2.56651 14.2991 3.20094 15.23 3.99713 16.0117C4.79333 16.7934 5.73569 17.4106 6.77043 17.8282C7.80516 18.2457 8.912 18.4553 10.0277 18.4451C11.1435 18.4348 12.2463 18.2049 13.2732 17.7685C14.3001 17.332 15.231 16.6976 16.0127 15.9014C16.7944 15.1052 17.4116 14.1628 17.8291 13.1281C18.2467 12.0934 18.4563 10.9865 18.446 9.87079C18.4358 8.75504 18.2059 7.65224 17.7694 6.62534C16.888 4.55143 15.2188 2.91261 13.1291 2.0694C11.0393 1.22619 8.70023 1.24766 6.62632 2.12909C4.55241 3.01052 2.91359 4.67971 2.07038 6.76945C1.22717 8.85919 1.24864 11.1983 2.13007 13.2722Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_95_4026">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}
