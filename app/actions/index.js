export const UPDATE_GLSL = 'UPDATE_GLSL';
export const UPDATE_JS = 'UPDATE_JS';
export const SET_EFFECT_RESOLUTION = 'SET_EFFECT_RESOLUTION';
export const SET_FRAME = 'SET_FRAME';

export function updateGLSL(code) {
  return {
    type: UPDATE_GLSL,
    payload: {
      src: code
    }
  };
}

export function updateJS(code) {
  return {
    type: UPDATE_JS,
    payload: {
      src: code
    }
  };
}

export function setEffectResolution(resolution) {
  return {
    type: SET_EFFECT_RESOLUTION,
    payload: {
      resolution
    }
  };
}

export function setFrame(frame) {
  return {
    type: SET_FRAME,
    payload: {
      frame
    }
  };
}
