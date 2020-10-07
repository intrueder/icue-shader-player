/* eslint-disable no-underscore-dangle */
import preProcess from './preprocessor';

const sdk = require('cue-sdk');
const fs = require('fs');
const path = require('path');
const raf = require('raf');
const parser = require('./glsl-parser');
const { stdlib, generator } = require('./glsl-compiler');

class ParametersStorage {
  constructor() {
    this._store = {};
  }

  getParams(effectId) {
    return this._store[effectId] || (this._store[effectId] = {});
  }

  setResolution(effectId, x, y) {
    const p = this.getParams(effectId);
    p['iResolution'] = p['resolution'] = p['u_resolution'] = stdlib.Vec2(x, y);
    p['iMouse'] = p['mouse'] = p['u_mouse'] = stdlib.Vec2(x / 2, y / 2);
  }

  setBeginTime(effectId) {
    const p = this.getParams(effectId);
    const now = performance.now() / 1000.0;
    p['startedAt'] = now;
    this._store[effectId] = p;
  }

  updateTime(effectId) {
    const p = this.getParams(effectId);
    const now = performance.now() / 1000.0;
    const time = now - (p['startedAt'] || now);
    p['iTime'] = p['time'] = p['u_time'] = time;
    this._store[effectId] = p;
  }
}

class EffectRuntime {
  constructor(effectId, store) {
    this._id = effectId;
    this._store = store;
  }

  getDouble(parameterName) {
    return this._store.getParams(this._id)[parameterName] || 0;
  }
}

class API {
  constructor() {
    console.log(sdk.CorsairPerformProtocolHandshake());
    this._store = new ParametersStorage();
    this._effectsRegistry = {};
    this._frameGenerators = {};
    this._states = {};
    this._nextId = 0;
    this.detailLevel = 5;
  }

  render(effectId) {
    const frame = this._frameGenerators[effectId]();

    const rdc = frame.reduce((prev, curr) => {
      if (!prev[curr.id]) {
        prev[curr.id] = curr;
      } else {
        prev[curr.id].rgb = curr.rgb;
      }

      return prev;
    }, this._states.frame || {});

    this._states.frame = rdc;
    const ledColors = Object.keys(rdc).map(k => rdc[k]).map(led => ({
      ledId: led.id,
      r: led.rgb[0],
      g: led.rgb[1],
      b: led.rgb[2]
    }));

    sdk.CorsairSetLedsColors(ledColors);
  }

  _createEffectRunner(effectName, effectId, leds) {
    const transform = x => 255 * Math.min(Math.max(x, 0), 1);
    let src = this.glslEffects[effectName];
    src = preProcess(src);
    const ast = parser.parse(src);
    const f = generator.generate(ast);
    const effectEnv = this._store.getParams(effectId);
    effectEnv['gl_FragCoord'] = stdlib.Vec3(0, 0, 0.0);
    effectEnv['gl_FragColor'] = stdlib.Vec4(0, 0, 0, 1.0);
    effectEnv['iChannel0'] = { name: 'iChannel0' };
    effectEnv['iChannel1'] = { name: 'iChannel1' };
    effectEnv['iChannel2'] = { name: 'iChannel2' };
    effectEnv['iChannel3'] = { name: 'iChannel3' };

    const [maxX, maxY] = effectEnv['iResolution'].d;
    const N = maxX * maxY * 4;
    let frame = new ImageData(maxX, maxY);
    for (let a = 3; a < N; a += 4) {
      frame.data[a] = 255;
    }
    const getpos = (x, y) => ((y * maxX) + x) * 4;
    return () => {
      const step = this.detailLevel;
      const coord = effectEnv['gl_FragCoord'];
      for (let y = 0; y < maxY; y += step) {
        for (let x = 0; x < maxX; x += step) {
          coord.set(0, x);
          coord.set(1, maxY - y);
          const fragColor = effectEnv['gl_FragColor'].d;
          fragColor[0] = fragColor[1] = fragColor[2] = 0;
          fragColor[3] = 1.0;

          f(stdlib, effectEnv);
          let [r, g, b] = effectEnv['gl_FragColor'].d;
          r = transform(r);
          g = transform(g);
          b = transform(b);
          for (let yi = y; yi <= y + step && yi < maxY; yi += 1) {
            for (let xi = x; xi <= x + step && xi < maxX; xi += 1) {
              const i = getpos(xi, yi);
              if (i < N) {
                frame.data[i + 0] = r;
                frame.data[i + 1] = g;
                frame.data[i + 2] = b;
                //frame.data[i + 3] = 255;
              }
            }
          }
        }
      }

      if (this._frameHook) {
        frame = this._frameHook(frame);
      }

      const ln = leds.length;
      // for (let li = 0; li < ln; li++) {
      //   let led = leds[li];
      //   const i = getpos(led.x, led.y);
      //   const col = led.rgb || [0,0,0];
      //   col[0] = frame.data[i + 0];
      //   col[1] = frame.data[i + 1];
      //   col[2] = frame.data[i + 2];
      //   led.rgb = col;
      // }

      for (let li = 0; li < ln; li++) {
        let led = leds[li];

        const x = led.x * (maxX - 1);
        const y = led.y * (maxY - 1);

        // linear interpolation
        const xl = Math.floor(x);
        const yl = Math.floor(y);
        const xr = Math.ceil(x);
        const yr = Math.ceil(y);
        const a1 = x - xl;
        const a2 = xr - x;
        const b1 = y - yl;
        const b2 = yr - y;
        const posl = getpos(xl, yl);
        const col = led.rgb || [0, 0, 0];
        col[0] = frame.data[posl + 0];
        col[1] = frame.data[posl + 1];
        col[2] = frame.data[posl + 2];

        for (let i = 0; i < 3; i++) {
          if (yl == yr && xl == xr) {
            // already here
          } else if (yl == yr) {
            col[i] = (a1 * frame.data[getpos(xl, yl) + i] + a2 * frame.data[getpos(xr, yl) + i]);
          } else if (xl == xr) {
            col[i] = (b1 * frame.data[getpos(xl, yl) + i] + b2 * frame.data[getpos(xl, yr) + i]);
          } else {
            col[i] = (b1 * (a1 * frame.data[getpos(xl, yl) + i] + a2 * frame.data[getpos(xr, yl) + i]) + b2 * (a1 * frame.data[getpos(xl, yr) + i] + a2 * frame.data[getpos(xr, yr) + i]));
          }
        }

        led.rgb = col;
      }


      return leds;

      // return leds.map(led => {
      //   const i = getpos(led.x, led.y);
      //   const col = led.rgb || [0,0,0];
      //   col[0] = frame.data[i + 0];
      //   col[1] = frame.data[i + 1];
      //   col[2] = frame.data[i + 2];
      //   return {
      //     id: led.id,
      //     x: led.x,
      //     y: led.y,
      //     rgb: col
      //   };
      // });
    };
  }

  loadEffects() {
    this.glslEffects = {};
    const rootPath = process.resourcesPath || __dirname;
    const dir = path.join(rootPath, 'shaders');
    const files = fs.readdirSync(dir);
    for (let fileName of files) {
      const src = fs.readFileSync(path.join(dir, fileName), 'utf8');
      this.glslEffects[fileName.split('.')[0]] = src;
    }

    Object.keys(this.glslEffects).forEach(eff => {
      this._effectsRegistry[eff] = {
        params: {}
      };
    });

    this._effectsRegistry['custom'] = {
      params: {}
    };

    this._effectsRegistry['colorlerp'] = {
      params: {
        color1: {
          type: 'vec3',
          defaultValue: stdlib.Vec3(0.5, 0.0, 0.5)
        },
        color2: {
          type: 'vec3',
          defaultValue: stdlib.Vec3(0.5, 0.0, 0.0)
        },
        duration: {
          type: 'number',
          defaultValue: 2.0
        }
      }
    };
  }

  createEffect(effectName, leds, framehook) {
    this._frameHook = framehook;
    const id = this._nextId++;
    const xmax = leds.reduce((prev, curr) => Math.max(prev, curr.left), 0);
    const ymax = leds.reduce((prev, curr) => Math.max(prev, curr.top), 0);
    const xmin = leds.reduce((prev, curr) => Math.min(prev, curr.left), xmax);
    const ymin = leds.reduce((prev, curr) => Math.min(prev, curr.top), ymax);
    const avgsz = leds.reduce((prev, curr) => prev + curr.width, 0) / leds.length;
    // this._store.setResolution(id, xmax - xmin + Math.ceil(avgsz), ymax - ymin + Math.ceil(avgsz));
    this._store.setResolution(id, 210, 70);

    // const ledsPositions = leds.map(l => ({ id: l.ledId, x: l.left - xmin, y: l.top - ymin }));
    const ledsPositions = leds.map(l => {
      const larr = [];
      // const step = this.detailLevel;
      // for (let py = 0; py < l.height; py += step) {
      //   for (let px = 0; px < l.width; px += step) {
      //     larr.push({ id: l.ledId, x: l.left + px - xmin, y: l.top + py - ymin });
      //   }
      // }
      larr.push({ id: l.ledId, x: (l.left - xmin) / (xmax - xmin), y: (l.top - ymin) / (ymax - ymin) });
      return larr;
    }).reduce((prev, curr) => prev.concat(curr), []);
    // console.log(ledsPositions);
    const runEffect = this._createEffectRunner(effectName, id, ledsPositions);
    const eff = () => {
      this._store.updateTime(id);
      return runEffect();
    };
    const parr = this._effectsRegistry[effectName].params;
    const ep = this._store.getParams(id);
    Object.keys(parr).forEach(p => ep[p] = parr[p].defaultValue);
    this._frameGenerators[id] = eff;
    return id;
  }

  setStateById(effectId) {
    this.clearStateById(effectId);
    this._states = {}; // TODO: !!!!!
    this._store.setBeginTime(effectId);
    this._states[effectId] = {
      active: true
    };

    const loop = () => {
      this.render(effectId);
      this._animationHandle = raf(loop);
    };

    this._animationHandle = raf(loop);
  }

  clearStateById(effectId) {
    this._states[effectId] = {
      active: false
    };

    raf.cancel(this._animationHandle);
  }

  setEffectParameter(effectId, parameterName, value) {
    const ep = this._store.getParams(effectId);
    ep[parameterName] = value;
  }

  getEffectParameters(effectName) {
    const src = this.glslEffects[effectName];
    const ast = parser.parse(src);
    return generator.getGlobals(ast).filter(p => !p.name.startsWith('gl_') && !p.name.startsWith('u_'));
  }

  getEffectSource(effectName) {
    const src = this.glslEffects[effectName];
    const ast = parser.parse(src);
    return generator.generate(ast, true);
  }

  getLeds() {
    const zoom = 1;
    // return [
    // {
    //   ledId: 1,
    //   left: 0,
    //   top: 0,
    //   width: 100,
    //   height: 100
    // },
    // {
    //   ledId: 2,
    //   left: 120,
    //   top: 0,
    //   width: 100,
    //   height: 100
    // },
    // {
    //   ledId: 3,
    //   left: 0,
    //   top: 120,
    //   width: 100,
    //   height: 100
    // },
    // {
    //   ledId: 4,
    //   left: 240,
    //   top: 120,
    //   width: 100,
    //   height: 100
    // }
    // ];
    return sdk.CorsairGetLedPositions().map(led => Object.assign(led, {
      left: Math.floor(led.left * zoom),
      top: Math.floor(led.top * zoom)
    }));
  }
}

export default API;
