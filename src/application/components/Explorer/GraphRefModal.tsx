/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { hasGraphRefBeenAuthenticated } from "./postMessageAuthHelpers";
import {
  DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF,
  postMessageToEmbed,
} from "./postMessageHelpers";
import { Telescope } from "./Telescope";

export const GraphRefModal = ({
  onClose,
  graphRef,
  setGraphRef,
  setNewGraphRefLoading,
  newGraphRefLoading,
  embeddedExplorerIFrame,
  wasTriggeredByIntrospection,
}: {
  onClose: () => void;
  graphRef: string;
  setGraphRef: (graphRef: string) => void;
  setNewGraphRefLoading: (newValue: boolean) => void;
  newGraphRefLoading: boolean;
  embeddedExplorerIFrame: HTMLIFrameElement;
  wasTriggeredByIntrospection: boolean;
}): React.ReactElement => {
  const [graphId, setGraphId] = useState<string>();
  const [graphVariant, setGraphVariant] = useState<string>();

  return (
    <>
      <div
        css={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          backgroundColor: "rgb(25, 28, 35)",
          opacity: "0.55",
        }}
      ></div>
      <div
        css={{
          width: 470,
          height: 400,
          position: "absolute",
          margin: "auto",
          top: "150px",
          left: "calc(50% - 250px)",
          display: "flex",
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow:
            "rgb(0 0 0 / 12%) 0px 16px 32px 0px, rgb(18 21 26 / 4%) 0px 0px 0px 1px",
          fontFamily: '"Source Sans Pro", sans-serif',
          fontSize: 15,
          textAlign: "center",
        }}
      >
        <div css={{ display: "block", margin: "auto" }}>
          {newGraphRefLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div css={{ margin: "2rem" }}>
                <div
                  css={{
                    display: "flex",
                    margin: "auto",
                    marginTop: -80,
                    width: 125,
                    height: 100,
                    marginBottom: 60,
                  }}
                >
                  <Telescope />
                </div>
                <div
                  css={{
                    marginBottom: "1rem",
                    fontWeight: 550,
                    fontSize: 18,
                  }}
                >
                  {wasTriggeredByIntrospection
                    ? "We could not introspect your schema."
                    : "Choose another graph to populate the Explorer."}
                </div>
                <p
                  css={{
                    display: "flex",
                    margin: "auto",
                    color: "#5A6270",
                    lineHeight: 1.5,
                    textAlign: "left",
                  }}
                >
                  {wasTriggeredByIntrospection
                    ? "Would you like to use a schema registered in Apollo Studio to populate Explorer? "
                    : ""}
                  To continue, log in and authorize to use your Studio account.
                </p>
                <div
                  css={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    marginTop: "1.5rem",
                    width: "100%",
                  }}
                >
                  <div
                    css={{
                      display: "flex",
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}
                  >
                    <div css={{}}>
                      <div css={{ fontWeight: 550, marginBottom: 4 }}>
                        Graph id
                      </div>
                      <input
                        value={graphId}
                        css={{
                          padding: "1rem",
                          backgroundColor: "#F4F6F8",
                          borderRadius: 4,
                          marginRight: "1rem",
                          height: 20,
                          border: "1px solid #DEE2E7",
                          width: 195,
                        }}
                        type="text"
                        onChange={(e) => setGraphId(e.target.value)}
                        placeholder="acephei"
                      />
                    </div>
                    <div css={{}}>
                      <div css={{ fontWeight: 550, marginBottom: 4 }}>
                        Graph variant
                      </div>
                      <input
                        value={graphVariant}
                        css={{
                          padding: "1rem",
                          backgroundColor: "#F4F6F8",
                          borderRadius: 4,
                          height: 20,
                          border: "1px solid #DEE2E7",
                          width: 195,
                        }}
                        name="value"
                        onChange={(e) => setGraphVariant(e.target.value)}
                        placeholder="current"
                      />
                    </div>
                  </div>
                </div>
                <div
                  css={{
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    type="button"
                    css={{
                      backgroundColor: "white",
                      marginRight: "1rem",
                      cursor: "pointer",
                      padding: 8,
                      width: 110,
                      borderRadius: 4,
                      fontWeight: 550,
                      border: "1px solid #DEE2E7",
                    }}
                    onClick={onClose}
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    css={{
                      backgroundColor:
                        !graphId || !graphVariant ? "#F4F6F8" : "#3f20ba",
                      color: !graphId || !graphVariant ? "#777F8E" : "white",
                      ...(!graphId || !graphVariant
                        ? {}
                        : { cursor: "pointer" }),
                      padding: 8,
                      width: 110,
                      borderRadius: 4,
                      fontWeight: 550,
                      border: "1px solid #DEE2E7",
                    }}
                    disabled={!graphId || !graphVariant}
                    onClick={() => {
                      const newGraphRef = `${graphId}@${graphVariant}`;
                      if (graphId && graphVariant && newGraphRef !== graphRef) {
                        setNewGraphRefLoading(true);
                        // if the graphRef has already been auth'd,
                        // we can just pass it as a param, otherwise we must auth!
                        if (hasGraphRefBeenAuthenticated(newGraphRef)) {
                          setGraphRef(newGraphRef);
                        } else {
                          postMessageToEmbed({
                            embeddedExplorerIFrame,
                            message: {
                              name: DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF,
                              graphRef: newGraphRef,
                            },
                          });
                        }
                      }
                    }}
                  >
                    Authorize
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
