import React, { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_COLOR } from "./queries";
import Color from "./components/Color";

const ColorLookup = () => {
  const [hexCode, setHexCode] = useState("");
  const [getColor, { data }] = useLazyQuery(GET_COLOR);
  const color = data?.color;

  return (
    <div className="lookup">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getColor({ variables: { hex: hexCode } });
        }}
      >
        <input
          type="text"
          placeholder="Look up color details by hex code"
          value={hexCode}
          onChange={(e) => setHexCode(e.target.value)}
        />
        <button type="submit">Lookup</button>
      </form>
      {color && (
        <Color
          contrast={color.contrast}
          hexCode={color.hex}
          name={color.name}
          isSaved={color.saved}
        />
      )}
    </div>
  );
};

export default ColorLookup;
