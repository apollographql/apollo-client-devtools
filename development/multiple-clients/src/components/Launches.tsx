import { TypedDocumentNode, gql, useSuspenseQuery } from "@apollo/client";

interface LaunchesQuery {
  launches: Array<{
    id: string;
    mission_name: string;
    launch_year: string;
    launch_success: boolean;
  }>;
}

const LAUNCHES_QUERY: TypedDocumentNode<
  LaunchesQuery,
  { limit?: number; offset?: number }
> = gql`
  query LaunchesQuery($limit: Int, $offset: Int) {
    launches(limit: $limit, offset: $offset) {
      id
      mission_name
      launch_year
      launch_success
    }
  }
`;

export function Launches({ offset }: { offset: number }) {
  const { data } = useSuspenseQuery(LAUNCHES_QUERY, {
    variables: { limit: 10, offset },
  });

  return (
    <div>
      {data.launches.map((launch) => (
        <div key={launch.id}>
          <div>Mission: {launch.mission_name}</div>
          <div>Year: {launch.launch_year}</div>
          <div>Success: {launch.launch_success ? "✅" : "❌"}</div>
        </div>
      ))}
    </div>
  );
}
