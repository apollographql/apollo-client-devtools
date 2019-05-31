import PropTypes from "prop-types";
import React from "react";
import { Sidebar } from "../Sidebar";
import classnames from "classnames";
import flattenDeep from "lodash.flattendeep";
import "./inspector.less";

export default class Inspector extends React.Component {
  static childContextTypes = {
    inspectorContext: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      dataWithOptimistic: null,
      ids: [],
      selectedId: null,
      toHighlight: {},
      searchTerm: "",
    };

    this.setSearchTerm = this.setSearchTerm.bind(this);
  }

  updateDataInStore(dataWithOptimistic) {
    let toHighlight = {};
    if (this.state.searchTerm.length >= 3) {
      toHighlight = highlightFromSearchTerm({
        data: dataWithOptimistic,
        query: this.state.searchTerm,
      });
    }

    const unsortedIds = Object.keys(dataWithOptimistic).filter(
      id => id[0] !== "$",
    );
    const highlightedIds = Object.keys(toHighlight).filter(
      id => id[0] !== "$" && id !== "ROOT_QUERY",
    );
    const sortedIdsWithoutRoot = unsortedIds
      .filter(id => id !== "ROOT_QUERY" && highlightedIds.indexOf(id) < 0)
      .sort();
    const ids =
      sortedIdsWithoutRoot.length === 0
        ? []
        : [...highlightedIds, "ROOT_QUERY", ...sortedIdsWithoutRoot];
    const selectedId = this.state.selectedId || ids[0];
    this.setState({
      dataWithOptimistic,
      toHighlight,
      ids,
      selectedId: this.state.selectedId || ids[0],
    });
  }

  componentDidMount() {
    // this.updateData();
    if (this.props.state.inspector) {
      this.updateDataInStore(this.props.state.inspector);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._interval);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps) {
      return [null, null, null, null];
    }
    this.updateDataInStore(nextProps.state.inspector);
  }

  getChildContext() {
    return {
      inspectorContext: {
        dataWithOptimistic: this.state.dataWithOptimistic,
        toHighlight: this.state.toHighlight,
        selectId: this.selectId.bind(this),
      },
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.selectedId !== this.state.selectedId) {
      function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const html = document.documentElement;
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || html.clientHeight) &&
          rect.right <= (window.innerWidth || html.clientWidth)
        );
      }
      const node = document.getElementById(nextState.selectedId);
      if (node && !isInViewport(node)) node.scrollIntoView();
    }
  }

  selectId(id) {
    this.setState({
      selectedId: id,
    });
  }

  setSearchTerm(searchTerm) {
    let toHighlight = {};

    if (searchTerm.length >= 3) {
      toHighlight = highlightFromSearchTerm({
        data: this.state.dataWithOptimistic,
        query: searchTerm,
      });
    }

    this.setState({
      searchTerm,
      toHighlight,
    });
  }

  renderSidebarItem(id) {
    let className = "inspector-sidebar-item";

    if (id === this.state.selectedId) {
      className += " active";
    }

    if (this.state.toHighlight[id]) {
      className += " inspector-sidebar-highlighted";
    }

    return (
      <div
        id={id}
        key={`inspector-sidebar-item-${id}`}
        onClick={this.selectId.bind(this, id)}
        className={className}
      >
        {id}
      </div>
    );
  }

  render() {
    const { selectedId, dataWithOptimistic, searchTerm, ids } = this.state;

    return (
      <div className="inspector-panel body">
        <div className="inspector-body">
          <Sidebar className="inspector-sidebar" name="inspector-sidebar">
            <h4 className="inspector-sidebar-title">Cache</h4>
            <InspectorToolbar
              searchTerm={searchTerm}
              setSearchTerm={this.setSearchTerm}
            />
            {ids && ids.map(id => this.renderSidebarItem(id))}
          </Sidebar>
          <div className="inspector-main">
            {selectedId && (
              <StoreTreeFieldSet
                data={dataWithOptimistic}
                dataId={selectedId}
                expand={true}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const InspectorToolbar = ({ searchTerm, setSearchTerm }) => (
  <div className="inspector-toolbar">
    <input
      className="inspector-search"
      type="text"
      placeholder="Search..."
      onChange={evt => setSearchTerm(evt.target.value)}
      value={searchTerm}
    />
  </div>
);

function highlightFromSearchTerm({ data, query }) {
  const toHighlight = {};

  Object.keys(data).forEach(dataId => {
    dfsSearch({
      data,
      regex: new RegExp(query),
      toHighlight,
      dataId,
    });
  });

  return toHighlight;
}

function dfsSearch({ data, regex, toHighlight, pathToId = [], dataId }) {
  const storeObj = data[dataId];
  const storeObjHighlight = {};

  Object.keys(storeObj).forEach(storeFieldKey => {
    const arr = [storeObj[storeFieldKey]];

    const flatArr = flattenDeep(arr);

    flatArr.forEach(val => {
      const valueMatches = typeof val === "string" && regex.test(val);
      const keyMatches = regex.test(storeFieldKey);

      if (valueMatches || keyMatches) {
        storeObjHighlight[storeFieldKey] = val;
      }

      if (val && val.id && val.generated) {
        dfsSearch({
          data,
          regex,
          toHighlight,
          pathToId: [...pathToId, [dataId, storeFieldKey]],
          dataId: val.id,
        });
      }
    });
  });

  if (Object.keys(storeObjHighlight).length > 0) {
    toHighlight[dataId] = storeObjHighlight;

    pathToId.forEach(pathSegment => {
      toHighlight[pathSegment[0]] = toHighlight[pathSegment[0]] || {};
      toHighlight[pathSegment[0]][pathSegment[1]] =
        data[pathSegment[0]][pathSegment[1]];
    });
  }
}

// Props: data, dataId, expand
class StoreTreeFieldSet extends React.Component {
  static contextTypes = {
    inspectorContext: PropTypes.object.isRequired,
  };

  constructor(props) {
    super();
    this.state = {
      expand: props.expand || props.dataId[0] === "$",
    };

    this.toggleExpand = this.toggleExpand.bind(this);
    this.selectId = this.selectId.bind(this);
  }

  getStoreObj() {
    return (
      this.context.inspectorContext.dataWithOptimistic[this.props.dataId] || {}
    );
  }

  getHighlightObj() {
    return this.context.inspectorContext.toHighlight[this.props.dataId];
  }

  shouldDisplayId() {
    return this.props.dataId[0] !== "$";
  }

  keysToDisplay() {
    return Object.keys(this.getStoreObj())
      .filter(key => key !== "__typename")
      .sort();
  }

  renderFieldSet({ doubleIndent }) {
    const storeObj = this.getStoreObj();
    const highlightObj = this.getHighlightObj();

    let className = "store-tree-field-set";

    if (doubleIndent) {
      className += " double-indent";
    }

    return (
      <div className={className}>
        {this.keysToDisplay().map(key => (
          <StoreTreeField
            key={key}
            storeKey={key}
            value={storeObj[key]}
            highlight={!!(highlightObj && highlightObj[key])}
          />
        ))}
      </div>
    );
  }

  toggleExpand() {
    this.setState(({ expand }) => ({ expand: !expand }));
  }

  selectId() {
    this.context.inspectorContext.selectId(this.props.dataId);
  }

  render() {
    return (
      <span>
        {this.shouldDisplayId() && (
          <span
            className={classnames("store-tree-ref-id toggle", {
              "store-tree-ref-id-inline": this.props.inArray,
            })}
            onClick={this.toggleExpand}
          >
            <span
              className={classnames("triangle", {
                toggled: !this.state.expand,
              })}
            >
              &#9662;
            </span>
            <span className="data-id">{this.props.dataId}</span>
            <span className="jump-to-object" onClick={this.selectId} />
          </span>
        )}
        <div>
          {this.state.expand &&
            this.renderFieldSet({ doubleIndent: this.shouldDisplayId() })}
        </div>
      </span>
    );
  }
}

const StoreTreeArray = ({ value }) => {
  return (
    <div className="store-tree-field-set">
      {value.map((item, index) => (
        <StoreTreeArrayItem key={index} item={item} index={index} />
      ))}
    </div>
  );
};

const StoreTreeArrayItem = ({ item, index }) => (
  <div>
    <span className="inspector-field-key">{index}</span>
    :
    <StoreTreeValue value={item} inArray={true} />
  </div>
);

const StoreTreeObject = ({ value, highlight, inArray }) => {
  if (isIdReference(value)) {
    return (
      <StoreTreeFieldSet
        key={`storee-tree-field-set-${value.id}`}
        dataId={value.id}
        inArray={inArray}
      />
    );
  }

  let className = "";

  if (typeof value === "string") {
    className += " inspector-value-string";
  }

  if (typeof value === "number") {
    className += " inspector-value-number";
  }

  if (highlight) {
    className += " inspector-highlight";
  }

  return <span className={className}>{JSON.stringify(value)}</span>;
};

// props: data, value
const StoreTreeValue = props => (
  <span>
    {Array.isArray(props.value) ? (
      <StoreTreeArray {...props} />
    ) : (
      <StoreTreeObject {...props} />
    )}
  </span>
);

// Props: data, storeKey, value
class StoreTreeField extends React.Component {
  static contextTypes = {
    inspectorContext: PropTypes.object.isRequired,
  };

  getPossibleTypename() {
    let unwrapped = this.props.value;
    let isArray = false;

    while (Array.isArray(unwrapped)) {
      unwrapped = unwrapped[0];
      isArray = true;
    }

    const targetStoreObj =
      unwrapped &&
      unwrapped.id &&
      this.context.inspectorContext.dataWithOptimistic[unwrapped.id];

    const baseTypename = targetStoreObj && targetStoreObj.__typename;

    if (baseTypename && isArray) {
      return "[" + baseTypename + "]";
    }

    return baseTypename;
  }

  renderPossibleTypename() {
    const __typename = this.getPossibleTypename();

    if (!__typename) {
      return "";
    }

    return <span className="inspector-typename">{__typename}</span>;
  }

  render() {
    let className = "inspector-field-key";

    if (this.props.highlight) {
      className += " inspector-highlight";
    }

    return (
      <div>
        <span className={className}>{this.props.storeKey}</span>:{" "}
        {this.renderPossibleTypename()}
        <StoreTreeValue
          value={this.props.value}
          highlight={this.props.highlight}
        />
      </div>
    );
  }
}

// Should be imported from AC
function isIdReference(storeObj) {
  return storeObj && storeObj.type === "id";
}
