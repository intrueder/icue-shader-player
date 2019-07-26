import React, { Component } from 'react';

export class Controls extends Component {
  render() {
    if (!this.props.playing) {
      var playpause = <i id="play" onClick={this.props.onClick} className="fa fa-fw fa-play"></i>;
    } else {
      var playpause = <i id="pause" onClick={this.props.onClick} className="fa fa-fw fa-pause"></i>;
    }

    return (
      <div className="Controls">
        {playpause}
      </div>
    );
  }
};