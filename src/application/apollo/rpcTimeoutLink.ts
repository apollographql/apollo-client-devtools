import { RPC_MESSAGE_TIMEOUT } from "@/extension/errorMessages";
import { ApolloLink } from "@apollo/client";
import { tap } from "rxjs";
import { BannerAlert } from "../components/BannerAlert";

export const rpcTimeoutLink = new ApolloLink((operation, forward) => {
  return forward(operation).pipe(
    tap((result) => {
      if (
        result.errors?.some((error) => error.message === RPC_MESSAGE_TIMEOUT)
      ) {
        BannerAlert.show({
          type: "error",
          content:
            "Could not communicate with the client. The extension might have updated in the background. Please refresh the page and close and reopen the devtools.",
        });
      }
    })
  );
});
