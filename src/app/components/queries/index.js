import React, { useState } from "react";
import classnames from "classnames";
import ListPanel from "../list-panel";

function Queries(props) {
  const { queries } = props;

  return <ListPanel listItems={queries} listType={"queries"} />;
}

export default Queries;
