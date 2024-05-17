import type { Brand } from "../types/utils";

const SNAPSHOT_MATCHER = /^0.0.0-pr-(?<prNumber>\d+)-(?<timestamp>\d+)$/;
const TIMESTAMP_MATCHER =
  /^(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})(?<minutes>\d{2})(?<seconds>\d{2})$/;

export type SnapshotVersion = Brand<string, "SnapshotVersion">;

export function isSnapshotRelease(version: string): version is SnapshotVersion {
  return version.startsWith("0.0.0");
}

export function parseSnapshotRelease(version: SnapshotVersion) {
  const match = SNAPSHOT_MATCHER.exec(version)!;

  return {
    prNumber: match.groups!.prNumber,
    timestamp: match.groups!.timestamp,
  };
}

export function parseSnapshotTimestamp(timestamp: string) {
  return Date.parse(
    timestamp.replace(
      TIMESTAMP_MATCHER,
      "$<year>-$<month>-$<day>T$<hour>:$<minutes>:$<seconds>.000Z"
    )
  );
}
