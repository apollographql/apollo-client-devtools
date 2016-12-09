import React from 'react';

import './inspector.less';

export default class Inspector extends React.Component {
  static propTypes = {
    state: React.PropTypes.object.isRequired,
  }

  static childContextTypes = {
    inspectorContext: React.PropTypes.object.isRequired,
  }

  constructor() {
    super();

    this.state = {
      dataWithOptimistic: null,
      ids: [],
      selectedId: null,
      toHighlight: {},
      searchTerm: '',
    };

    this.setSearchTerm = this.setSearchTerm.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  updateData() {
    const dataWithOptimistic = this.props.state.data;

    let toHighlight = {};

    if (this.state.searchTerm.length >= 3) {
      toHighlight = highlightFromSearchTerm({
        data: this.state.dataWithOptimistic,
        query: this.state.searchTerm,
      });
    }

    const ids = getIdsFromData(dataWithOptimistic);

    this.setState({
      dataWithOptimistic,
      toHighlight,
      ids,
      selectedId: this.state.selectedId || ids[0],
    });
  }

  componentDidMount() {
    this.updateData();
  }

  componentWillReceiveProps() {
    this.updateData();
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
    let className = 'inspector-sidebar-item';

    if (id === this.state.selectedId) {
      className += ' active';
    }

    if (this.state.toHighlight[id]) {
      className += ' inspector-sidebar-highlighted';
    }

    return (
      <div onClick={this.selectId.bind(this, id)} className={className}>{id}</div>
    );
  }

  render() {
    return (
      <div className="inspector-panel body">
        <div className="inspector-body">
          <div className="inspector-sidebar">
          <div className="inspector-sidebar-title">Apollo client state</div>
            <InspectorToolbar
              searchTerm={this.state.searchTerm}
              setSearchTerm={this.setSearchTerm}
            />
          {this.state.ids.map(id => this.renderSidebarItem(id))}
          </div>
          <div className="inspector-main">
            {this.state.selectedId &&
              <StoreTreeFieldSet data={this.state.dataWithOptimistic} dataId={this.state.selectedId} expand={true} />}
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
      onChange={(evt) => setSearchTerm(evt.target.value)}
      value={searchTerm}
    />
  </div>
)

function highlightFromSearchTerm({ data, query }) {
  const toHighlight = {};

  Object.keys(data).forEach((dataId) => {
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

  Object.keys(storeObj).forEach((storeFieldKey) => {
    const val = storeObj[storeFieldKey];

    const valueMatches = typeof val === 'string' && regex.test(val);
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

  if (Object.keys(storeObjHighlight).length > 0) {
    toHighlight[dataId] = storeObjHighlight;

    pathToId.forEach((pathSegment) => {
      toHighlight[pathSegment[0]] = toHighlight[pathSegment[0]] || {};
      toHighlight[pathSegment[0]][pathSegment[1]] = data[pathSegment[0]][pathSegment[1]];
    });
  }
}

function getIdsFromData(data) {
  const ids = Object.keys(data).filter(id => id[0] !== '$');

  const sortedIdsWithoutRoot = ids.filter(id => id !== 'ROOT_QUERY').sort();

  // XXX handle root mutation and subscription fields as well
  const rootFirst = ['ROOT_QUERY', ...sortedIdsWithoutRoot];

  return rootFirst;
}

// Props: data, dataId, expand
class StoreTreeFieldSet extends React.Component {
  static contextTypes = {
    inspectorContext: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super();
    this.state = {
      expand: props.expand || props.dataId[0] === '$',
    };

    this.toggleExpand = this.toggleExpand.bind(this);
    this.selectId = this.selectId.bind(this);
  }

  getStoreObj() {
    return this.context.inspectorContext.dataWithOptimistic[this.props.dataId];
  }

  getHighlightObj() {
    return this.context.inspectorContext.toHighlight[this.props.dataId];
  }

  shouldDisplayId() {
    return this.props.dataId[0] !== '$';
  }

  keysToDisplay() {
    return Object.keys(this.getStoreObj())
      .filter(key => key !== '__typename')
      .sort();
  }

  renderFieldSet({ doubleIndent }) {
    const storeObj = this.getStoreObj();
    const highlightObj = this.getHighlightObj();

    let className = 'store-tree-field-set';

    if (doubleIndent) {
      className += ' double-indent';
    }

    return (
      <div className={className}>
        {this.keysToDisplay().map((key) => (
          <StoreTreeField
            storeKey={key}
            value={storeObj[key]}
            highlight={!!(highlightObj && highlightObj[key])}
          />
        ))}
      </div>
    )
  }

  toggleExpand() {
    this.setState(({ expand }) => ({ expand: !expand }));
  }

  selectId() {
    this.context.inspectorContext.selectId(this.props.dataId);
  }

  render() {
    return (
      <div>
        {this.shouldDisplayId() && (
          <span className="store-tree-ref-id">
            <span onClick={this.toggleExpand}>
              {this.state.expand ? <span>&#9662; </span> : <span>&#9656; </span>}
              <span className="data-id">{this.props.dataId}</span>
            </span>
            <span onClick={this.selectId} />
          </span>
        )}
        {this.state.expand && this.renderFieldSet({ doubleIndent: this.shouldDisplayId() })}
      </div>
    )
  }
}

const StoreTreeArray = ({ value }) => (
  <div>
    {value.map(item => <StoreTreeValue value={item} /> )}
  </div>
)

const StoreTreeObject = ({ value, highlight }) => {
  if (isIdReference(value)) {
    return (
      <StoreTreeFieldSet dataId={value.id} />
    )
  }

  let className = '';

  if (typeof value === 'string') {
    className += ' inspector-value-string';
  }

  if (typeof value === 'number') {
    className += ' inspector-value-number';
  }

  if (highlight) {
    className += ' inspector-highlight';
  }

  return (
    <span className={className}>
      {JSON.stringify(value)}
    </span>
  );
}

// props: data, value
class StoreTreeValue extends React.Component {
  render() {
    return (
      <span>
        {Array.isArray(this.props.value) ?
          <StoreTreeArray {...this.props} /> :
          <StoreTreeObject {...this.props} />
        }
      </span>
    )
  }
}

// Props: data, storeKey, value
class StoreTreeField extends React.Component {
  static contextTypes = {
    inspectorContext: React.PropTypes.object.isRequired,
  }

  getPossibleTypename() {
    let unwrapped = this.props.value;
    let isArray = false;

    while (Array.isArray(unwrapped)) {
      unwrapped = unwrapped[0];
      isArray = true;
    }

    const targetStoreObj = unwrapped &&
      unwrapped.id &&
      this.context.inspectorContext.dataWithOptimistic[unwrapped.id];

    const baseTypename = targetStoreObj && targetStoreObj.__typename;

    if (baseTypename && isArray) {
      return '[' + baseTypename + ']';
    }

    return baseTypename;
  }

  renderPossibleTypename() {
    const __typename = this.getPossibleTypename();

    if (! __typename) {
      return '';
    }

    return (
      <span className="inspector-typename">{__typename}</span>
    );
  }

  render() {
    let className = 'inspector-field-key';

    if (this.props.highlight) {
      className += ' inspector-highlight';
    }

    return (
      <div>
        <span className={className}>
          {this.props.storeKey}
        </span>
        :{" "}
        {this.renderPossibleTypename()}
        <StoreTreeValue value={this.props.value} highlight={this.props.highlight} />
      </div>
    )
  }
}

// Should be imported from AC
function isIdReference(storeObj) {
  return storeObj && storeObj.type === 'id';
}
