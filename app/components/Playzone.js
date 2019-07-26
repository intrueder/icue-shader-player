import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Controls } from './Controls'

import styles from './Playzone.scss';

export default class Playzone extends Component {
  constructor(props, context) {
    super(props, context);

    this.setCanvasRef = element => {
      this.canvas = element;
      this.canvasCtx = element && element.getContext('2d');
      if (this.canvasCtx) {
        this.canvasCtx.scale(3, 3);
      }
    };

    this.setCanvasBufRef = element => {
      this.canvasBuf = element;
      this.canvasBufCtx = element && element.getContext('2d');
    };
  }

  componentDidUpdate() {
    const { frame } = this.props;
    if (frame) {
      this.canvasBufCtx.putImageData(frame, 0, 0);
      this.canvasCtx.drawImage(this.canvasBuf, 0, 0);
    }
  }

  render() {
    const { framerate, size } = this.props;
    return (
      <div className="Playzone">
        <Controls onClick={this.props.onClick} playing={this.props.playing} />
        <div>
          <div className={styles.framerate}>{`${framerate} fps`}</div>
          <canvas id="preview" ref={this.setCanvasRef} width={size.x} height={size.y} />
        </div>
        <canvas id="previewbuf" className={styles.previewbuf} ref={this.setCanvasBufRef} />
      </div>
    );
  }
}

Playzone.propTypes = {
  frame: PropTypes.shape(),
  size: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  framerate: PropTypes.number
};

Playzone.defaultProps = {
  frame: null,
  size: { x: 630, y: 212 },
  framerate: 0
};
