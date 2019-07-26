/* eslint-disable no-param-reassign */
const re = /#define\s+(\S+)\s+(.+)(\r|\n)/g;
const knownUniforms = ['vec2 iResolution', 'vec2 iMouse', 'float iTime', 'sampler2D iChannel0', 'sampler2D iChannel1', 'sampler2D iChannel2', 'sampler2D iChannel3'].map(u => `uniform ${u};\n`).join('');

export default function preProcess(src) {
  const defines = {};
  src = src.replace(re, (match, g1, g2) => {
    defines[g1] = g2;
    return '';
  });

  Object.keys(defines).forEach(d => {
    src = src.replace(new RegExp(`\\b${d}\\b`, 'g'), defines[d]);
  });

  let fragColorVarName = 'fragColor';
  src = src.replace(/mainImage\s*\((\s*out\s*vec4\s*(\w+)\s*,)(.+\))/, (match, g1, g2, g3) => {
    fragColorVarName = g2;
    return `mainImage(${g3}`;
  });
  src = src.replace(new RegExp(`\\b${fragColorVarName}\\b`, 'g'), 'gl_FragColor');
  return knownUniforms + src;
}
