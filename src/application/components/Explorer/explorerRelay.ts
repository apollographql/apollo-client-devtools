import Relay from "../../../Relay";
import { ExplorerResponse } from "../../../types";

const explorer = new Relay();

export const sendResponseToExplorer = ({
  payload,
}: {
  payload: ExplorerResponse;
}): void => {
  if (payload) {
    explorer.broadcast({
      message: `explorer:response:${payload.operationName}`,
      payload: payload.response,
    });
  }
};
