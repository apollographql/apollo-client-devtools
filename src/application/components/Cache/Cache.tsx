import { Fragment, useState } from "react";
import { css } from "@emotion/react";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Search } from "./sidebar/Search";
import { EntityList } from "./sidebar/EntityList";
import { EntityView } from "./main/EntityView";
import { Loading } from "./common/Loading";
import { currentClient } from "../..";

const { Header, Sidebar, Main, Content } = SidebarLayout;

const h1Styles = css`
  font-family: monospace;
  font-weight: normal;
  font-size: ${rem(20)};
`;

const headerLabelStyles = css`
  margin: ${rem(3)} 0 0 ${rem(8)};
  font-family: "Source Sans Pro", sans-serif;
  color: ${colors.grey.light};
  text-transform: uppercase;
  font-size: ${rem(11)};
`;

const noDataStyles = css`
  margin-left: ${rem(12)};
  text-transform: uppercase;
  font-size: ${rem(13)};
  font-weight: normal;
  letter-spacing: ${rem(1)};
  color: var(--whiteTransparent);
  padding-top: ${rem(16)};
`;

const GET_CACHE = gql`
  query GetCache($clientId: ID!) {
    client(id: $clientId) @client {
      cache
    }
  }
`;

export function Cache({ navigationProps }: {
  navigationProps: {
    queriesCount: number,
    mutationsCount: number,
  }
}): JSX.Element {
  const [searchResults, setSearchResults] = useState({});
  const [cacheId, setCacheId] = useState<string>("ROOT_QUERY");
  const selectedClient = useReactiveVar(currentClient);

  const { loading, data } = useQuery(GET_CACHE, {
    variables: {
      clientId: selectedClient
    }
  });

  let parsedData: Record<string, any> = {};
  if (!loading && data && data?.client?.cache) {
    parsedData = JSON.parse(data.client.cache);
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
          <h3 css={noDataStyles}>No cache data</h3>
        )}
      </Sidebar>
      <Content>
        <Header>
          {dataExists ? (
            <Fragment>
              <h1 css={h1Styles}>{cacheId || undefined}</h1>
              <span css={headerLabelStyles}>CACHE ID</span>
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
