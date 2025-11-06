import { useCallback, type CSSProperties, type FC } from "react";
import { Added, Changed, Deleted, type Diff } from "../utilities/diff";
import type { ColorValue } from "./ObjectViewer";
import { ObjectViewer, useGetObjectViewerThemeOverride } from "./ObjectViewer";
import { colors } from "@apollo/brand";
import { clsx } from "clsx";

interface Props {
  diff: Diff;
}

export function ObjectDiff({ diff }: Props) {
  return (
    <ObjectViewer
      value={diff}
      getTypeOf={(value) => {
        if (value instanceof Changed) {
          return "Changed";
        }
      }}
      customRenderers={{
        Changed: ChangedValue,
      }}
      builtinRenderers={{
        arrayItem: DiffValue,
        arrayIndex: StrikethroughWhenDeleted,
        collapsedArray: StrikethroughWhenDeleted,
        collapsedObject: StrikethroughWhenDeleted,
        objectPair: DiffValue,
        string: StrikethroughWhenDeleted,
        boolean: StrikethroughWhenDeleted,
        number: StrikethroughWhenDeleted,
        null: StrikethroughWhenDeleted,
        undefined: StrikethroughWhenDeleted,
        objectKey: StrikethroughWhenDeleted,
        sparseArrayEmptyItem: SparseArrayItem,
      }}
    />
  );
}

const { text } = colors.tokens;

function useDiffThemeOverrides() {
  const getTheme = useGetObjectViewerThemeOverride();

  return useCallback(
    ({
      textColor,
      punctuation,
    }: {
      textColor: ColorValue;
      punctuation?: ColorValue;
    }) => {
      return getTheme({
        arrow: punctuation,
        typeNumber: textColor,
        typeBoolean: textColor,
        typeString: textColor,
        objectKey: textColor,
        punctuation,
        ellipsis: punctuation,
      });
    },
    [getTheme]
  );
}

function DiffValue({
  value,
  DefaultRender,
}: {
  value: unknown;
  DefaultRender: FC<{
    collapsible?: boolean;
    value?: unknown;
    className?: string;
    style?: CSSProperties;
    context?: Record<string, any>;
  }>;
}) {
  const getOverrides = useDiffThemeOverrides();

  if (value instanceof Added) {
    return (
      <DefaultRender
        className="bg-successSelected dark:bg-successSelected-dark"
        value={value.value}
        style={getOverrides({
          textColor: text.success,
          punctuation: text.neutral,
        })}
      />
    );
  }

  if (value instanceof Deleted) {
    return (
      <DefaultRender
        className="bg-errorSelected dark:bg-errorSelected-dark"
        value={value.value}
        style={getOverrides({
          textColor: text.error,
          punctuation: text.neutral,
        })}
        context={{ mode: "deleted" }}
      />
    );
  }

  if (value instanceof Changed) {
    return <DefaultRender collapsible={false} />;
  }

  return <DefaultRender />;
}

function StrikethroughWhenDeleted({
  className,
  context,
  DefaultRender,
}: {
  className?: string;
  context?: Record<string, any>;
  DefaultRender: FC<{ className?: string }>;
}) {
  return (
    <DefaultRender
      className={clsx(
        { "line-through": context?.mode === "deleted" },
        className
      )}
    />
  );
}

function ChangedValue({
  value: changed,
  DefaultRender,
}: {
  value: Changed;
  DefaultRender: FC<{
    value?: unknown;
    className?: string;
    style?: CSSProperties;
    context?: Record<string, any>;
  }>;
}) {
  const getOverrides = useDiffThemeOverrides();

  return (
    <>
      <DefaultRender
        className="bg-errorSelected dark:bg-errorSelected-dark"
        value={changed.oldValue}
        context={{ mode: "deleted" }}
        style={getOverrides({
          textColor: text.error,
          punctuation: text.neutral,
        })}
      />
      <span>{" => "}</span>
      <DefaultRender
        className="bg-successSelected dark:bg-successSelected-dark"
        value={changed.newValue}
        style={getOverrides({
          textColor: text.success,
          punctuation: text.neutral,
        })}
      />
    </>
  );
}

function SparseArrayItem({
  DefaultRender,
}: {
  DefaultRender: FC<{ label: string }>;
}) {
  return <DefaultRender label="unchanged" />;
}
