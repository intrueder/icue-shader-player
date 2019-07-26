import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Playzone from './Playzone.container';
import { EffectList } from './EffectList'
import API from '../utils/api';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      detailLevel: 4,
      blurRadius: 4,
      contrast: 30,
      effectId: null
    };
    this.api = new API();
    this.api.loadEffects();
    this.effects = Object.keys(this.api.glslEffects).map((e, i) => ({ id: (i + 1), title: e}));
    this.api.detailLevel = this.state.detailLevel;
    this.leds = this.api.getLeds();
    this.setCanvasRef = element => {
      this.canvas = element;
      this.canvasCtx = element && element.getContext('2d');
      if (this.canvasCtx) {
        this.canvasCtx.filter = 'blur(4px) saturate(200%) contrast(130%)';
        this.canvasCtx.imageSmoothingEnabled = false;
      }
    };

    this.setCanvasBufRef = element => {
      this.canvasBuf = element;
      this.canvasBufCtx = element && element.getContext('2d');
      this.canvasBufCtx.imageSmoothingEnabled = false;
    };

    this.handlePlayzoneClick = this.handlePlayzoneClick.bind(this);
    this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
  }

  playEffect() {
    const effectName = 'custom';
    this.api.glslEffects[effectName] = this.props.glslSource;

    const eff = this.api.createEffect(effectName, this.leds, (frame) => {
      const { blurRadius, contrast } = this.state;
      if (frame) {
        this.canvasCtx.filter = `blur(${blurRadius}px) saturate(200%) contrast(${contrast + 100}%) brightness(200%)`;
        this.canvasBufCtx.putImageData(frame, 0, 0);
        this.canvasCtx.drawImage(this.canvasBuf, 0, 0);
      }

      const processedFrame = this.canvasCtx.getImageData(0, 0, frame.width, frame.height);
      this.props.setFrame(processedFrame);
      return processedFrame;
    });

    this.props.uniforms.forEach(u => {
      this.api.setEffectParameter(eff, u.name, u.value || 0.0000000000001);
    });

    this.api.setStateById(eff);
    this.setState({
      effectId: eff
    });
  }

  stopEffect() {
    this.api.clearStateById(this.state.effectId);
    this.setState({
      effectId: null
    });
  }

  handlePlayzoneClick(e) {
    if (!this.state.activeEffect){
      return;
    }

    if(e.target.id == 'play') {
      this.setState({ playing: true }, () => this.playEffect());
    } else {
      this.setState({ playing: false }, () => this.stopEffect());
    }
  }

  handleSelectionChanged(effect) {
    const glsl = this.api.glslEffects[effect.title];
    this.props.updateGLSL(glsl);
    this.setState({ activeEffect: effect, playing: true }, () => this.playEffect());
  }

  render() {
    return (
      <div className="App">
        <Playzone onClick={this.handlePlayzoneClick} playing={this.state.playing} />
        <EffectList items={this.effects} onItemClick={this.handleSelectionChanged} selectedItem={this.state.activeEffect} />
        <canvas style={{ display: 'none' }} ref={this.setCanvasRef} />
        <canvas style={{ display: 'none' }} ref={this.setCanvasBufRef} />
      </div>
    );
  }
}

App.Props = {
  updateGLSL: PropTypes.func.isRequired,
  updateJS: PropTypes.func.isRequired,
  glslSource: PropTypes.string,
  uniforms: PropTypes.array
};

export default App;