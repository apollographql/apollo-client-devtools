import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useSubscription } from "@apollo/client/react";
import type {
  CacheTimingsSubscription,
  CacheTimingsSubscriptionVariables,
} from "../../types/gql";
import { Button } from "../Button";
import { PageSpinner } from "../PageSpinner";
import { Screens, navigateTo } from "../Layouts/Navigation";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";

const SCREEN_LABELS: Partial<Record<Screens, string>> = {
  [Screens.Queries]: "Queries",
  [Screens.Mutations]: "Mutations",
  [Screens.Fragments]: "Fragments",
};

const CACHE_TIMINGS_SUBSCRIPTION: TypedDocumentNode<
  CacheTimingsSubscription,
  CacheTimingsSubscriptionVariables
> = gql`
  subscription CacheTimingsSubscription($clientId: ID!) {
    cacheTimingsUpdated(clientId: $clientId) {
      id
      broadcastWatches {
        ...TimingStatFields
      }
      operations {
        key
        kind
        name
        write {
          ...TimingStatFields
        }
        diff {
          ...TimingStatFields
        }
      }
    }
  }

  fragment TimingStatFields on TimingStat {
    count
    selfMs
    totalMs
  }
`;

type Snapshot = CacheTimingsSubscription["cacheTimingsUpdated"];
type Stat = Snapshot["broadcastWatches"];

interface Row {
  key: string;
  kind: string;
  label: string;
  // Tab to open when the row is clicked
  screen?: Screens;
  name?: string;
  total: number;
  writeCount: number;
  writeMs: number;
  diffCount: number;
  diffMs: number;
}

type Column = Exclude<keyof Row, "key" | "kind" | "screen" | "name">;

const SCREENS_BY_KIND: Partial<Record<string, Screens>> = {
  query: Screens.Queries,
  mutation: Screens.Mutations,
  fragment: Screens.Fragments,
};

const EMPTY_STAT: Stat = {
  __typename: "TimingStat",
  count: 0,
  selfMs: 0,
  totalMs: 0,
};

function subtract(stat: Stat, baseline: Stat | undefined = EMPTY_STAT): Stat {
  return {
    ...stat,
    count: stat.count - baseline.count,
    selfMs: stat.selfMs - baseline.selfMs,
    totalMs: stat.totalMs - baseline.totalMs,
  };
}

const integerFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});
const decimalFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatMs(ms: number) {
  if (ms > 0 && ms < 0.1) {
    return "<0.1";
  }

  return ms >= 100 ? integerFormat.format(ms) : decimalFormat.format(ms);
}

function formatCount(count: number) {
  return integerFormat.format(count);
}

interface PerformanceProps {
  clientId: string | undefined;
}

export function Performance({ clientId }: PerformanceProps) {
  const [baseline, setBaseline] = useState<Snapshot | null>(null);
  const [sort, setSort] = useState<{ column: Column; desc: boolean }>({
    column: "total",
    desc: true,
  });

  const { data } = useSubscription(CACHE_TIMINGS_SUBSCRIPTION, {
    variables: { clientId: clientId as string },
    skip: clientId == null,
    // Snapshots replace each other wholesale, so there's no need to cache them
    fetchPolicy: "no-cache",
  });

  const snapshot = data?.cacheTimingsUpdated;
  // Recording restarts (e.g. page reload, devtools reconnect) reset the
  // counters, so a baseline from a previous recording no longer applies.
  const activeBaseline = baseline?.id === snapshot?.id ? baseline : null;

  const { broadcast, rows, totals } = useMemo(() => {
    if (!snapshot) {
      return { broadcast: EMPTY_STAT, rows: [], totals: null };
    }

    const baselineByKey = new Map(
      activeBaseline?.operations.map((operation) => [operation.key, operation])
    );
    const broadcast = subtract(
      snapshot.broadcastWatches,
      activeBaseline?.broadcastWatches
    );

    const rows: Row[] = snapshot.operations
      .map((operation) => {
        const base = baselineByKey.get(operation.key);
        const write = subtract(operation.write, base?.write);
        const diff = subtract(operation.diff, base?.diff);

        return {
          key: operation.key,
          kind: operation.kind,
          label: operation.name,
          screen: SCREENS_BY_KIND[operation.kind],
          name: operation.name,
          total: write.selfMs + diff.selfMs,
          writeCount: write.count,
          writeMs: write.selfMs,
          diffCount: diff.count,
          diffMs: diff.selfMs,
        };
      })
      .filter((row) => row.writeCount > 0 || row.diffCount > 0);

    const totals = rows.reduce<Row>(
      (totals, row) => ({
        ...totals,
        total: totals.total + row.total,
        writeCount: totals.writeCount + row.writeCount,
        writeMs: totals.writeMs + row.writeMs,
        diffCount: totals.diffCount + row.diffCount,
        diffMs: totals.diffMs + row.diffMs,
      }),
      {
        key: "totals",
        kind: "",
        label: "Totals",
        total: broadcast.selfMs,
        writeCount: 0,
        writeMs: 0,
        diffCount: 0,
        diffMs: 0,
      }
    );

    return { broadcast, rows, totals };
  }, [snapshot, activeBaseline]);

  const sortedRows = useMemo(() => {
    const { column, desc } = sort;

    return [...rows].sort((a, b) => {
      const result =
        column === "label"
          ? a.label.localeCompare(b.label)
          : (a[column] as number) - (b[column] as number);

      return (desc ? -result : result) || a.key.localeCompare(b.key);
    });
  }, [rows, sort]);

  if (!snapshot || !totals) {
    return <PageSpinner />;
  }

  function sortBy(column: Column) {
    setSort((sort) => ({
      column,
      desc: sort.column === column ? !sort.desc : column !== "label",
    }));
  }

  const headerProps = { sort, onSort: sortBy };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-6">
      <div className="flex gap-10 items-start">
        <Card title="Totals">
          <Metric label="Total" value={formatMs(totals.total)} unit="ms" />
          <Metric label="Writes" value={formatCount(totals.writeCount)} />
          <Metric
            label="Write time"
            value={formatMs(totals.writeMs)}
            unit="ms"
          />
          <Metric label="Diffs" value={formatCount(totals.diffCount)} />
          <Metric label="Diff time" value={formatMs(totals.diffMs)} unit="ms" />
        </Card>
        <Card title="Broadcast watches">
          <Metric label="Count" value={formatCount(broadcast.count)} />
          <Metric
            label="Avg"
            value={formatMs(
              broadcast.count ? broadcast.selfMs / broadcast.count : 0
            )}
            unit="ms"
          />
          <Metric label="Total" value={formatMs(broadcast.selfMs)} unit="ms" />
          <Metric
            label="Incl. diffs"
            value={formatMs(broadcast.totalMs)}
            unit="ms"
          />
        </Card>
        <Button
          className="ml-auto"
          size="sm"
          variant="secondary"
          onClick={() => setBaseline(snapshot)}
        >
          Reset
        </Button>
      </div>

      <table className="w-full text-sm tabular-nums">
        <thead className="text-secondary dark:text-secondary-dark">
          <tr>
            <th />
            <th />
            <th
              colSpan={2}
              className="font-semibold text-right px-3 pt-1 border-b border-primary dark:border-primary-dark"
            >
              Write
            </th>
            <th
              colSpan={2}
              className="font-semibold text-right px-3 pt-1 border-b border-primary dark:border-primary-dark"
            >
              Diff
            </th>
          </tr>
          <tr>
            <SortableHeader column="label" align="left" {...headerProps}>
              Operation
            </SortableHeader>
            <SortableHeader column="total" {...headerProps}>
              Total (ms)
            </SortableHeader>
            <SortableHeader column="writeCount" {...headerProps}>
              Count
            </SortableHeader>
            <SortableHeader column="writeMs" {...headerProps}>
              Time (ms)
            </SortableHeader>
            <SortableHeader column="diffCount" {...headerProps}>
              Count
            </SortableHeader>
            <SortableHeader column="diffMs" {...headerProps}>
              Time (ms)
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <TableRow key={row.key} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-md font-semibold text-heading dark:text-heading-dark">
        {title}
      </h2>
      <div className="flex gap-6">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-secondary dark:text-secondary-dark">
        {label}
      </span>
      <span className="text-lg font-semibold tabular-nums text-heading dark:text-heading-dark whitespace-nowrap">
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-secondary dark:text-secondary-dark">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function SortableHeader({
  column,
  align = "right",
  sort,
  onSort,
  children,
}: {
  column: Column;
  align?: "left" | "right";
  sort: { column: Column; desc: boolean };
  onSort: (column: Column) => void;
  children: ReactNode;
}) {
  const isSorted = sort.column === column;

  return (
    <th
      className={`font-normal py-1 px-3 first:pl-0 whitespace-nowrap ${
        align === "left" ? "text-left" : "text-right"
      }`}
      aria-sort={isSorted ? (sort.desc ? "descending" : "ascending") : "none"}
    >
      <button
        className={isSorted ? "text-heading dark:text-heading-dark" : ""}
        onClick={() => onSort(column)}
      >
        {children}
        {isSorted ? (sort.desc ? " ↓" : " ↑") : ""}
      </button>
    </th>
  );
}

const KIND_LABELS: Record<string, string> = {
  query: "Query",
  mutation: "Mutation",
  subscription: "Subscription",
  fragment: "Fragment",
};

function KindBadge({ kind }: { kind: string }) {
  return (
    <Tooltip content={KIND_LABELS[kind] ?? kind} delayDuration={1000}>
      <Badge
        variant="info"
        className="font-code shrink-0 size-5 inline-flex items-center justify-center"
      >
        {kind.at(0)?.toUpperCase()}
      </Badge>
    </Tooltip>
  );
}

function NumberCell({ value, format }: { value: number; format: string }) {
  return (
    <td className="py-1.5 px-3 text-right">
      {value === 0 ? (
        <span className="text-secondary dark:text-secondary-dark opacity-50">
          –
        </span>
      ) : (
        format
      )}
    </td>
  );
}

function TableRow({ row }: { row: Row }) {
  const { screen, name } = row;
  const isClickable = screen !== undefined && name !== undefined;

  return (
    <tr
      className={`border-t border-primary dark:border-primary-dark ${
        isClickable
          ? "cursor-pointer hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark"
          : ""
      }`}
      title={isClickable ? `Open in ${SCREEN_LABELS[screen]} tab` : undefined}
      onClick={isClickable ? () => navigateTo(screen, name) : undefined}
    >
      <td className="py-1.5 pr-3 max-w-0 w-full">
        <div className="flex items-center gap-2">
          <KindBadge kind={row.kind} />
          <span className="font-code overflow-hidden text-ellipsis whitespace-nowrap">
            {row.label}
          </span>
        </div>
      </td>
      <NumberCell value={row.total} format={formatMs(row.total)} />
      <NumberCell value={row.writeCount} format={formatCount(row.writeCount)} />
      <NumberCell value={row.writeMs} format={formatMs(row.writeMs)} />
      <NumberCell value={row.diffCount} format={formatCount(row.diffCount)} />
      <NumberCell value={row.diffMs} format={formatMs(row.diffMs)} />
    </tr>
  );
}
