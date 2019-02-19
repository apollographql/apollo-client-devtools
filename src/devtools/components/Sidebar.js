import React, { Component } from "react";
import classnames from "classnames";
import { StorageContext } from "../context/StorageContext";
export class Sidebar extends Component {
  static contextType = StorageContext;

  constructor(props, context) {
    super(props, context);

    this.initResize = this.initResize.bind(this);
    this.Resize = this.Resize.bind(this);
    this.stopResize = this.stopResize.bind(this);
  }

  componentDidMount() {
    const savedWidth = this.context.storage.getItem(
      `apollo-client:${this.props.name}`,
    );
    if (savedWidth) this.sidebar.style.width = `${savedWidth}px`;
  }

  initResize(e) {
    window.addEventListener("mousemove", this.Resize, false);
    window.addEventListener("mouseup", this.stopResize, false);
  }

  Resize(e) {
    const width = e.clientX - this.sidebar.offsetLeft;
    this.context.storage.setItem(`apollo-client:${this.props.name}`, width);
    this.sidebar.style.width = `${width}px`;
    window.getSelection().removeAllRanges();
  }

  stopResize(e) {
    window.removeEventListener("mousemove", this.Resize, false);
    window.removeEventListener("mouseup", this.stopResize, false);
  }

  render() {
    const { children } = this.props;
    return (
      <div
        className={classnames(this.props.className, "sidebar")}
        ref={sidebar => {
          this.sidebar = sidebar;
        }}
      >
        <div className="dragger" onMouseDown={this.initResize} />
        {children}
      </div>
    );
  }
}
