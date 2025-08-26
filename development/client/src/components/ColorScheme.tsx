import React from "react";
import Color from "./Color";

const ColorScheme = ({
  colors,
}: {
  colors: Array<{
    contrast: string;
    hex: string;
    name: string;
    saved: boolean;
  }> | null;
}) => {
  if (!colors) {
    return null;
  }

  return (
    <div className="scheme">
      {colors.map(({ contrast, hex, name, saved }, index) => (
        <Color
          key={`${hex}-${index}`}
          className="scheme__color"
          contrast={contrast}
          hexCode={hex}
          name={name}
          isSaved={saved}
        />
      ))}
    </div>
  );
};

export default ColorScheme;
