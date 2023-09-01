import { Fragment, useState } from "react";
import { gql, useQuery } from "@apollo/client";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Search } from "./sidebar/Search";
import { EntityList } from "./sidebar/EntityList";
import { EntityView } from "./main/EntityView";
import { Loading } from "./common/Loading";

const { Header, Sidebar, Main, Content } = SidebarLayout;

const GET_CACHE = gql`
  query GetCache {
    cache @client
  }
`;

export function Cache({
  navigationProps,
}: {
  navigationProps: {
    queriesCount: number;
    mutationsCount: number;
  };
}): JSX.Element {
  const [searchResults, setSearchResults] = useState({});
  const [cacheId, setCacheId] = useState<string>("ROOT_QUERY");

  const { loading, data } = useQuery(GET_CACHE);

  let parsedData: Record<string, any> = {};
  if (!loading && data && data.cache) {
    parsedData = JSON.parse(data.cache);
  }

  const dataExists = parsedData && Object.keys(parsedData).length > 0;

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <Sidebar navigationProps={navigationProps}>
        {loading ? (
          <Loading />
        ) : dataExists ? (
          <Fragment>
            <Search data={parsedData} setSearchResults={setSearchResults} />
            <EntityList
              data={parsedData}
              cacheId={cacheId}
              setCacheId={setCacheId}
              searchResults={searchResults}
            />
          </Fragment>
        ) : (
          <h3 className="ml-3 uppercase text-sm font-normal pt-4 text-white/50 tracking-wider">
            No cache data
          </h3>
        )}
      </Sidebar>
      <Content>
        <Header>
          {dataExists ? (
            <Fragment>
              <h1 className="font-monospace font-normal text-xl">
                {cacheId || undefined}
              </h1>
              <span className="font-sans text-grey-light uppercase text-xs mt-1 ml-2">
                CACHE ID
              </span>
            </Fragment>
          ) : null}
        </Header>
        <Main>
          {loading ? (
            <Loading />
          ) : (
            <EntityView
              cacheId={cacheId}
              data={parsedData[cacheId]}
              searchResults={searchResults}
              setCacheId={setCacheId}
            />
          )}
        </Main>
      </Content>
    </SidebarLayout>
  );
}
