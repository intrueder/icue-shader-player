import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Playzone from './Playzone';
import * as Actions from '../actions';

let counter = 0;
let lastTime = performance.now();
let framerate = 0;

function mapStateToProps(state) {
  const now = performance.now();
  counter += 1;
  if (now - lastTime > 1000) {
    framerate = counter * 1000 / (now - lastTime);
    counter = 0;
    lastTime = now;
  }

  return {
    // size: state.ide.resolution,
    frame: state.ide.frame,
    frameId: state.ide.frameId,
    framerate: Math.floor(framerate)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Playzone);
