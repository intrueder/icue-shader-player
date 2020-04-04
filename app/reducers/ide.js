import {
  UPDATE_GLSL, UPDATE_JS, SET_EFFECT_RESOLUTION, SET_FRAME
} from '../actions';
import preProcess from '../utils/preprocessor';

const parser = require('../utils/glsl-parser');
const { generator } = require('../utils/glsl-compiler');

const INITIAL_STATE = {
  glsl: '',
  js: '',
  uniforms: [],
  frameId: 0, // used to trigger rerender for components that use frame
  frame: null // mutable, reference is unchanged most of the time
};

export default function glslReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_GLSL: {
      const s = { ...state };
      let { src } = action.payload;
      s.glsl = src;
      try {
        src = preProcess(src);
        const ast = parser.parse(src);
        s.js = generator.generate(ast, true);
        let uniforms = generator.getGlobals(ast).filter(g => g.type === 'float' && (g.name !== 'u_time' && g.name !== 'iTime' && g.name !== 'time'));
        let names = uniforms.map(u => u.name);
        s.uniforms = s.uniforms.filter(u => names.includes(u.name));
        names = s.uniforms.map(u => u.name);
        uniforms = uniforms.filter(u => !names.includes(u.name));
        s.uniforms = s.uniforms.concat(uniforms).map(u => ({ value: 1, ...u }));
      } catch (e) {
        s.js = e;
      }

      return s;
    }
    case UPDATE_JS: {
      const s = { ...state };
      s.js = action.payload.src;
      return s;
    }
    case SET_EFFECT_RESOLUTION: {
      const s = { ...state };
      s.resolution = action.payload.resolution;
      return s;
    }
    case SET_FRAME: {
      const s = { ...state };
      s.frameId += 1;
      s.frame = action.payload.frame;
      return s;
    }
    default:
      return state;
  }
}
