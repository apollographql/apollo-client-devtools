import { StatusBadge, type StatusBadgeProps } from "./StatusBadge";

interface HTTPStatusBadgeProps {
  status?: number;
}

export function HTTPStatusBadge({ status }: HTTPStatusBadgeProps) {
  if (status == null) {
    return (
      <StatusBadge color="gray" variant="hidden">
        Unknown
      </StatusBadge>
    );
  }

  let color: StatusBadgeProps["color"] = "gray";

  if (status >= 400) {
    color = "red";
  } else if (status >= 300) {
    color = "purple";
  } else if (status >= 100) {
    color = "green";
  }

  return (
    <StatusBadge color={color} variant="hidden">
      {status}
    </StatusBadge>
  );
}
