import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from './App';
import * as Actions from '../actions';

function mapStateToProps(state) {
  return {
    glslSource: state.ide.glsl,
    uniforms: state.ide.uniforms
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
