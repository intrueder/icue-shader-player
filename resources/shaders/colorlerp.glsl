  uniform vec2 u_resolution;
  uniform float u_time;
  varying float duration;

  vec3 color1 = vec3(1);
  vec3 color2 = vec3(1., .0, .0);
  
  void main() {
      gl_FragColor = vec4(mix(color1, color2, min(1, u_time / duration)), 1.0);
  }