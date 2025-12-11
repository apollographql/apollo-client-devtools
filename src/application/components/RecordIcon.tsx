import { twJoin } from "tailwind-merge";

interface Props {
  className?: string;
  isRecording?: boolean;
}

export function RecordIcon({ className, isRecording }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={twJoin(
        "block",
        isRecording
          ? "text-icon-error dark:text-icon-error-dark"
          : "text-icon-primary dark:text-icon-primary-dark",
        className
      )}
      viewBox="0 0 16 16"
    >
      <circle
        cx={8}
        cy={8}
        r={7}
        strokeWidth={2}
        fill="transparent"
        stroke="currentColor"
      />
      {isRecording ? (
        <rect
          x={5}
          y={5}
          rx={1}
          ry={1}
          width={6}
          height={6}
          fill="currentColor"
        />
      ) : (
        <circle cx={8} cy={8} r={4} fill="currentColor" />
      )}
    </svg>
  );
}
