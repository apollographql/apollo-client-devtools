const SNAPSHOT_MATCHER = /^0.0.0-pr-(?<prNumber>\d+)-(?<timestamp>\d+)$/;
const TIMESTAMP_MATCHER =
  /^(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})(?<minutes>\d{2})(?<seconds>\d{2})$/;

export function isSnapshotRelease(version: string) {
  return version.startsWith("0.0.0");
}

export function parseSnapshotRelease(version: string) {
  const match = SNAPSHOT_MATCHER.exec(version);

  return match && match.groups
    ? {
        prNumber: match.groups.prNumber,
        timestamp: match.groups.timestamp,
      }
    : null;
}

export function parseSnapshotTimestamp(timestamp: string) {
  return Date.parse(
    timestamp.replace(
      TIMESTAMP_MATCHER,
      "$<year>-$<month>-$<day>T$<hour>:$<minutes>:$<seconds>.000Z"
    )
  );
}
