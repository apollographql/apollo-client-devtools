/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { colors } from "@apollo/space-kit/colors";
import { GraphqlCodeBlock } from "graphql-syntax-highlighter-react";
import JSONTree from "react-json-tree";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import stringifyObject from "stringify-object";
import { 
  queryViewStyles, 
  headerStyles, 
  copyIconStyle, 
  queryStringHeader,
  queryStringMain,
  queryDataMain,
} from '../Queries/QueryViewer';

interface MutationViewerProps {
  mutationString: string
  variables: Record<string, any>
}

const queryDataHeader = css`
  grid-area: queryDataHeader; 
  display: flex;
  height: 100%;
  background-color: transparent;
  ${headerStyles}
  color: ${colors.black.base};

  svg {
    margin-right: 0;
    margin-left: auto;
  }
`;

export const MutationViewer = ({ mutationString = '', variables = {} }: MutationViewerProps) => (
  <div css={queryViewStyles}>
    <h4 css={queryStringHeader}>
      Mutation String 
      <CopyToClipboard text={mutationString}>
        <IconCopy css={copyIconStyle} data-testid="copy-mutation-string" />
      </CopyToClipboard> 
    </h4>
    <GraphqlCodeBlock
      className="GraphqlCodeBlock"
      css={queryStringMain}
      queryBody={mutationString}
    />
    <div>
      <div css={queryDataHeader}>
        <span>Variables</span>
        <CopyToClipboard text={stringifyObject(variables)}>
          <IconCopy css={copyIconStyle} data-testid="copy-mutation-variables" />
        </CopyToClipboard> 
      </div>
      <div css={queryDataMain}>
        <JSONTree data={variables} />
      </div>
    </div>
  </div>
);