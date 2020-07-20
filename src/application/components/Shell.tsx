import React from 'react';

const Shell = ({ children }) => (
  <div
    style={{
      backgroundImage:
        "linear-gradient(174deg,#1c2945 0,#2d4d5a 54%,#436a75 81%,#448b8e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }}
  >
    <div style={{ maxWidth: "50%" }}>{children}</div>
  </div>
);

export default Shell;
