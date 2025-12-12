import { Tooltip } from "./Tooltip";
import type { ButtonProps } from "./Button";
import { Button } from "./Button";
import { RecordIcon } from "./RecordIcon";

interface Props {
  isRecording: boolean;
  onClick?: () => void;
  label?: string;
  size: ButtonProps["size"];
}

export function RecordButton({
  isRecording,
  onClick,
  label = isRecording ? "Stop recording" : "Record",
  size,
}: Props) {
  return (
    <Tooltip content={label}>
      <Button
        aria-label={label}
        size={size}
        onClick={onClick}
        icon={<RecordIcon isRecording={isRecording} />}
        variant="hidden"
      />
    </Tooltip>
  );
}
