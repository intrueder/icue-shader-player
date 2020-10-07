  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float speed;
  uniform float direction;
  
  #define PI 3.1415926535897932384626433832795

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float d = radians(direction);
  
    float xr = uv.x * cos(d) - uv.y * sin(d);
    vec3 rgb = sin(-speed*u_time + (xr + vec3(.0, .66, .33)) * PI * 2.) * .5 + .5;
  
    gl_FragColor=vec4(rgb, 1.0);
  }