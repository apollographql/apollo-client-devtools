import React from 'react';
import PropTypes from 'prop-types';
import Color from './Color';

const ColorScheme = ({ colors }) => {
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

ColorScheme.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    hex: PropTypes.string,
  }))
}

export default ColorScheme;

