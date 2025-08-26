import React, { useEffect } from "react";
import { useQuery } from "./ClientContext";

import { GET_COLOR_SCHEME, GET_RANDOM_COLOR } from "./queries";
import ColorScheme from "./components/ColorScheme";

const MODE = {
  MONOCHROME: "MONOCHROME",
  MONOCHROME_DARK: "MONOCHROME-DARK",
  MONOCHROME_LIGHT: "MONOCHROME-LIGHT",
  ANALOGIC: "ANALOGIC",
  COMPLEMENT: "COMPLEMENT",
  ANALOGIC_COMPLEMENT: "ANALOGIC-COMPLEMENT",
  TRIAD: "TRIAD",
  QUAD: "QUAD",
};

const ColorSchemeGenerator = () => {
  const { data, refetch, startPolling, stopPolling } = useQuery(
    GET_RANDOM_COLOR,
    { fetchPolicy: "no-cache" }
  );
  const { data: schemeData } = useQuery(GET_COLOR_SCHEME, {
    variables: {
      hex: data?.random?.color?.hex,
      mode: MODE.ANALOGIC,
      count: 4,
    },
  });

  useEffect(() => {
    function onKeyPress(e: KeyboardEvent) {
      if (e.keyCode === 32) {
        refetch();
      }

      if (e.key === "s") {
        stopPolling();
      }

      if (e.key === "p") {
        startPolling(10000);
      }
    }

    window.addEventListener("keypress", onKeyPress);
    return () => window.removeEventListener("keypress", onKeyPress);
  });

  return <ColorScheme colors={schemeData?.scheme?.colors} />;
};

export default ColorSchemeGenerator;
