import React, { Component } from "react";
import "./Tracing.less";

export default class Tracing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracing: props.tracing,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      tracing: nextProps.tracing,
    });
  }

  render() {
    const tracing = this.state.tracing;

    return (
      <div>
        {tracing ? (
          <div className="tracingContainer">
            {tracing.execution.resolvers.map(entry => (
              <TracingEntry
                path={entry.path}
                startOffset={entry.startOffset}
                duration={entry.duration}
                totalDuration={tracing.duration}
              />
            ))}
          </div>
        ) : (
          <div> No tracing information present </div>
        )}
      </div>
    );
  }
}

class TracingEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      path: props.path,
      startOffset: props.startOffset,
      duration: props.duration,
      totalDuration: props.totalDuration,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      path: nextProps.path,
      startOffset: nextProps.startOffset,
      duration: nextProps.duration,
      totalDuration: nextProps.totalDuration,
    });
  }

  pathDisplayable(path) {
    return path.join(".");
  }

  durationDisplayable(duration) {
    // convert to micro seconds (tracing durations are all in nano seconds)
    const microSec = Math.round(duration / 1000);
    if (microSec > 1000000) {
      // if more than 1 second, return seconds with one decimal
      return Math.round(microSec / 100000) / 10 + " s";
    } else if (microSec > 1000) {
      // if more than 1 ms, return ms
      return Math.round(microSec / 1000) + " ms";
    } else {
      // else, return micro seconds
      return microSec + " µs";
    }
  }

  barWidthRatio(duration, totalDuration) {
    const pathWidth = this.pathWidthRatio();
    const durationWidth = this.durationWidthRatio();
    const maxWidthForBar = 1.0 - pathWidth - durationWidth;
    return duration / totalDuration * maxWidthForBar;
  }

  barOffsetRatio(startOffset, totalDuration) {
    return (
      this.pathWidthRatio() + this.barWidthRatio(startOffset, totalDuration)
    );
  }

  pathWidthRatio() {
    // buffer 10% width for path label
    return 0.1;
  }

  durationWidthRatio() {
    // buffer 5% width for duration label
    return 0.05;
  }

  render() {
    const { path, startOffset, duration, totalDuration } = this.state;
    const pathLabel = this.pathDisplayable(path);
    const durationLabel = this.durationDisplayable(this.state.duration);
    const barWidth = this.barWidthRatio(duration, totalDuration);
    const barOffset = this.barOffsetRatio(startOffset, totalDuration);

    const offsetPercentage = barOffset * 100;
    const barWidthPercentage = barWidth * 100;

    return (
      <div className="tracingRow">
        <div style={{ width: `${offsetPercentage}%` }}>
          <div className="tracingPath">{pathLabel}</div>
        </div>

        <div
          className="tracingBarContainer"
          style={{ width: `${barWidthPercentage}%` }}
        >
          <div className="tracingBar" />
        </div>

        <div className="tracingDuration">{durationLabel}</div>
      </div>
    );
  }
}
