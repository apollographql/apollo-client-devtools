import React, { useState } from "react";
import SaveIcon from "./SaveIcon";
import cx from "classnames";
import { useMutation } from "@apollo/client/react";
import { GET_SAVED_COLORS } from "../queries";
import {
  ADD_COLOR_TO_FAVORITES,
  REMOVE_COLOR_FROM_FAVORITES,
} from "../mutations";

const Color = ({
  className,
  contrast,
  hexCode,
  name,
  isSaved = false,
}: {
  className?: string;
  contrast?: string;
  hexCode?: string;
  name?: string;
  isSaved?: boolean;
}) => {
  const [saved, setSaved] = useState(isSaved);
  const variables = { color: { name, hex: hexCode, contrast } };
  const [addColor] = useMutation(ADD_COLOR_TO_FAVORITES, {
    variables,
    update(cache, { data: { addColor } }) {
      cache.writeQuery({
        query: GET_SAVED_COLORS,
        data: { favoritedColors: addColor },
      });
    },
  });
  const [removeColor] = useMutation(REMOVE_COLOR_FROM_FAVORITES, {
    variables,
    update(cache, { data: { removeColor } }) {
      const colorToRemove = removeColor[0];
      const { favoritedColors } = cache.readQuery<any>({
        query: GET_SAVED_COLORS,
      });
      const updatedColors = favoritedColors.filter(
        (color: { hex: string }) => color.hex !== colorToRemove.hex
      );
      cache.writeQuery({
        query: GET_SAVED_COLORS,
        data: { favoritedColors: updatedColors },
      });
    },
  });

  function onClick() {
    if (saved) {
      setSaved(false);
      removeColor();
    } else {
      setSaved(true);
      addColor();
    }
  }

  return (
    <div
      className={cx("color", className, {
        "contrast-dark": contrast === "#000000",
        "contrast-light": contrast === "#ffffff",
      })}
      style={{ backgroundColor: hexCode }}
    >
      <div className="color__save-icon" onClick={onClick}>
        <SaveIcon isSaved={saved} />
      </div>
      {name && <span className="color__name">{name}</span>}
      <span className="color__hexCode">{hexCode}</span>
    </div>
  );
};

export default Color;
