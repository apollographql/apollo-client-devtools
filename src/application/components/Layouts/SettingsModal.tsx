import { useLocalStorage } from "@/application/hooks/useLocalStorage";
import { Button } from "../Button";
import { ExternalLink } from "../ExternalLink";
import { Modal } from "../Modal";
import { TextField } from "../TextField";
import { Suspense } from "react";
import { Spinner } from "../Spinner";
import { DEFAULTS } from "@/application/utilities/storage";
import { Checkbox } from "../Checkbox";

declare const VERSION: string;

export function SettingsModal({
  open = false,
  onOpen,
}: {
  open?: boolean;
  onOpen: (open: boolean) => void;
}) {
  return (
    <Modal open={open} onClose={onOpen} size="md">
      <Modal.Header>
        <Modal.Title>Settings</Modal.Title>
        <Modal.Description>
          Devtools version:{" "}
          <ExternalLink
            className="font-code"
            href={`https://github.com/apollographql/apollo-client-devtools/releases/tag/apollo-client-devtools@${VERSION}`}
          >
            {VERSION}
          </ExternalLink>
        </Modal.Description>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <CacheWriteLimitTextField />
          <AutoRecordCacheWriteCheckbox />
        </Suspense>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" size="md" onClick={() => onOpen(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Keep each control in its own component to allow the local storage settings
// to load and suspend in parallel

function CacheWriteLimitTextField() {
  const [cacheLimit, setCacheLimit] = useLocalStorage("cacheWriteLimit");

  return (
    <TextField
      label="Cache write history size"
      size="sm"
      placeholder="Enter a max"
      type="number"
      defaultValue={cacheLimit}
      min={0}
      step={10}
      onBlur={(e) => {
        const { value } = e.target;

        if (value === "") {
          e.target.value = String(DEFAULTS.cacheWriteLimit);
          setCacheLimit(DEFAULTS.cacheWriteLimit);
        } else {
          setCacheLimit(Number(value));
        }
      }}
    />
  );
}

function AutoRecordCacheWriteCheckbox() {
  const [autoRecordCacheWrites, setAutoRecordCacheWrites] = useLocalStorage(
    "autoRecordCacheWrites"
  );

  return (
    <Checkbox
      label="Auto-record cache writes"
      checked={autoRecordCacheWrites}
      onChange={(e) => setAutoRecordCacheWrites(e.target.checked)}
    />
  );
}
