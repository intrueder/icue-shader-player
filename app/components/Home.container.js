import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from './Home';
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
